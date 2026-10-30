import type { BookIssue } from "../types/issue.types";
import { addDays, daysFromToday } from "../utils/date";

/**
 * Sample borrowing transactions. Dates are relative to today so that the
 * overdue / due-soon states always look realistic when the app is opened.
 */
interface Student {
  id: string;
  name: string;
  cls: string;
  phone: string;
}

const students: Record<string, Student> = {
  aarav: { id: "STU-24001", name: "Aarav Sharma", cls: "B.Sc Computer Science – II", phone: "98400 11201" },
  priya: { id: "STU-24002", name: "Priya Nair", cls: "B.Com – I", phone: "98400 11202" },
  karthik: { id: "STU-24003", name: "Karthik Raman", cls: "B.E. Mechanical – III", phone: "98400 11203" },
  divya: { id: "STU-24004", name: "Divya Iyer", cls: "B.A. English – II", phone: "98400 11204" },
  rahul: { id: "STU-24005", name: "Rahul Verma", cls: "B.Sc Physics – I", phone: "98400 11205" },
  sneha: { id: "STU-24006", name: "Sneha Reddy", cls: "BCA – III", phone: "98400 11206" },
  arjun: { id: "STU-24007", name: "Arjun Menon", cls: "B.E. CSE – IV", phone: "98400 11207" },
  meera: { id: "STU-24008", name: "Meera Krishnan", cls: "B.A. History – II", phone: "98400 11208" },
  vikram: { id: "STU-24009", name: "Vikram Singh", cls: "BBA – I", phone: "98400 11209" },
  ananya: { id: "STU-24010", name: "Ananya Das", cls: "B.Sc Mathematics – III", phone: "98400 11210" },
  rohan: { id: "STU-24011", name: "Rohan Gupta", cls: "B.E. ECE – II", phone: "98400 11211" },
  lakshmi: { id: "STU-24012", name: "Lakshmi Subramanian", cls: "B.Sc Chemistry – II", phone: "98400 11212" },
  farhan: { id: "STU-24013", name: "Farhan Ali", cls: "BCA – I", phone: "98400 11213" },
  kavya: { id: "STU-24014", name: "Kavya Pillai", cls: "B.A. Economics – III", phone: "98400 11214" },
  siddharth: { id: "STU-24015", name: "Siddharth Rao", cls: "B.E. CSE – II", phone: "98400 11215" },
};

let seq = 2000;

const loan = (
  s: Student,
  bookId: string,
  copy: number,
  issuedDaysAgo: number,
  opts: { loanDays?: number; returnedDaysAgo?: number; notes?: string; fine?: number } = {},
): BookIssue => {
  seq += 1;
  const issueDate = daysFromToday(-issuedDaysAgo);
  const returned = opts.returnedDaysAgo !== undefined;
  return {
    id: `ISS-${seq}`,
    studentId: s.id,
    studentName: s.name,
    studentClass: s.cls,
    studentPhone: s.phone,
    bookId,
    bookCopyId: `${bookId}-C${String(copy).padStart(2, "0")}`,
    issueDate,
    dueDate: addDays(issueDate, opts.loanDays ?? 14),
    status: returned ? "returned" : "issued",
    returnDate: returned ? daysFromToday(-(opts.returnedDaysAgo as number)) : undefined,
    returnCondition: returned ? "good" : undefined,
    fineAmount: opts.fine,
    notes: opts.notes,
  };
};

const S = students;

export const mockIssues: BookIssue[] = [
  // Returned (history)
  loan(S.aarav, "BK-1001", 1, 40, { returnedDaysAgo: 30 }),
  loan(S.priya, "BK-1030", 1, 38, { returnedDaysAgo: 20, fine: 20 }),
  loan(S.divya, "BK-1016", 1, 30, { returnedDaysAgo: 18 }),
  loan(S.rahul, "BK-1011", 1, 25, { returnedDaysAgo: 12 }),
  loan(S.meera, "BK-1027", 1, 22, { returnedDaysAgo: 9 }),
  loan(S.vikram, "BK-1031", 1, 20, { returnedDaysAgo: 6 }),
  loan(S.kavya, "BK-1028", 1, 18, { returnedDaysAgo: 4 }),
  loan(S.farhan, "BK-1005", 1, 15, { returnedDaysAgo: 2 }),
  loan(S.ananya, "BK-1014", 1, 12, { returnedDaysAgo: 1 }),
  loan(S.rohan, "BK-1006", 1, 9, { returnedDaysAgo: 0 }),

  // Overdue (issued > 14 days ago, still out)
  loan(S.karthik, "BK-1013", 1, 31, { notes: "Reminder sent by phone." }),
  loan(S.sneha, "BK-1007", 1, 24),
  loan(S.arjun, "BK-1002", 1, 21),
  loan(S.lakshmi, "BK-1012", 1, 19),
  loan(S.siddharth, "BK-1003", 1, 17),

  // Due soon (due within 3 days)
  loan(S.aarav, "BK-1007", 2, 13),
  loan(S.priya, "BK-1026", 1, 12),
  loan(S.divya, "BK-1021", 1, 12),
  loan(S.rohan, "BK-1015", 1, 11),

  // Recently issued, on time
  loan(S.meera, "BK-1029", 1, 9),
  loan(S.ananya, "BK-1013", 2, 8),
  loan(S.farhan, "BK-1001", 2, 7),
  loan(S.vikram, "BK-1032", 1, 6, { notes: "Reference copy – 2 week limit." }),
  loan(S.kavya, "BK-1018", 1, 5),
  loan(S.rahul, "BK-1008", 1, 4),
  loan(S.karthik, "BK-1024", 1, 3),
  loan(S.sneha, "BK-1004", 1, 2),
  loan(S.arjun, "BK-1022", 1, 1),
  loan(S.siddharth, "BK-1002", 2, 1),
  loan(S.lakshmi, "BK-1009", 1, 0),
];

/** Student directory placeholder – will be replaced by the student database later. */
export const mockStudents = Object.values(students).map(({ id, name, cls, phone }) => ({
  id,
  name,
  studentClass: cls,
  phone,
}));
