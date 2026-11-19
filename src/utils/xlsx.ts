/**
 * Minimal, dependency-free .xlsx reader: returns the first worksheet as rows of
 * strings. Handles shared strings, inline strings and numbers — enough for the
 * library spreadsheet. Uses the browser's DecompressionStream to unzip.
 */

const textDecoder = new TextDecoder();

/** Maps each file path inside the zip to its (still compressed) bytes. */
const readZipEntries = (buf: ArrayBuffer) => {
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  // End-of-central-directory record sits in the last 22 bytes (+ optional comment).
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not a valid .xlsx file");

  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const entries = new Map<string, { method: number; data: Uint8Array }>();

  for (let n = 0; n < count; n++) {
    if (view.getUint32(p, true) !== 0x02014b50) throw new Error("Corrupt .xlsx file");
    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const local = view.getUint32(p + 42, true);
    const name = textDecoder.decode(bytes.subarray(p + 46, p + 46 + nameLen));

    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    entries.set(name, { method, data: bytes.subarray(start, start + size) });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
};

const readText = async (entries: ReturnType<typeof readZipEntries>, path: string): Promise<string | null> => {
  const entry = entries.get(path);
  if (!entry) return null;
  if (entry.method === 0) return textDecoder.decode(entry.data);
  if (entry.method !== 8) throw new Error(`Unsupported compression in ${path}`);
  const stream = new Blob([entry.data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(stream).text();
};

const parseXml = (xml: string) => new DOMParser().parseFromString(xml, "application/xml");

/** "C12" -> 2 */
const columnIndex = (ref: string) => {
  let n = 0;
  for (const ch of ref) {
    const code = ch.charCodeAt(0);
    if (code < 65 || code > 90) break;
    n = n * 26 + (code - 64);
  }
  return n - 1;
};

/** Text of an <si>/<is> node, ignoring phonetic hints (<rPh>). */
const richText = (el: Element) =>
  Array.from(el.getElementsByTagName("t"))
    .filter((t) => t.parentElement?.localName !== "rPh")
    .map((t) => t.textContent ?? "")
    .join("");

/** Resolves the first sheet's file path via workbook.xml and its relationships. */
const firstSheetPath = async (entries: ReturnType<typeof readZipEntries>) => {
  const workbook = await readText(entries, "xl/workbook.xml");
  const rels = await readText(entries, "xl/_rels/workbook.xml.rels");
  if (workbook && rels) {
    const sheet = parseXml(workbook).getElementsByTagName("sheet")[0];
    const id =
      sheet?.getAttribute("r:id") ??
      sheet?.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
    const rel = Array.from(parseXml(rels).getElementsByTagName("Relationship")).find(
      (r) => r.getAttribute("Id") === id,
    );
    const target = rel?.getAttribute("Target");
    if (target) return target.startsWith("/") ? target.slice(1) : `xl/${target}`;
  }
  return "xl/worksheets/sheet1.xml";
};

export const readXlsxRows = async (buf: ArrayBuffer): Promise<string[][]> => {
  const entries = readZipEntries(buf);

  const sharedXml = await readText(entries, "xl/sharedStrings.xml");
  const shared = sharedXml ? Array.from(parseXml(sharedXml).getElementsByTagName("si")).map(richText) : [];

  const sheetXml = await readText(entries, await firstSheetPath(entries));
  if (!sheetXml) throw new Error("The spreadsheet has no worksheet");

  const rows: string[][] = [];
  for (const rowEl of Array.from(parseXml(sheetXml).getElementsByTagName("row"))) {
    const row: string[] = [];
    for (const c of Array.from(rowEl.getElementsByTagName("c"))) {
      const type = c.getAttribute("t");
      let value: string;
      if (type === "inlineStr") {
        const is = c.getElementsByTagName("is")[0];
        value = is ? richText(is) : "";
      } else {
        const raw = c.getElementsByTagName("v")[0]?.textContent ?? "";
        value = type === "s" ? shared[Number(raw)] ?? "" : raw;
      }
      row[columnIndex(c.getAttribute("r") ?? "")] = value;
    }
    rows.push(Array.from(row, (v) => v ?? ""));
  }
  return rows;
};
