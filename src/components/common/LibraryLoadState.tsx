import { useLibrary } from "../../context/LibraryContext";
import { Button } from "../../styles/ui";
import { EmptyState } from "./EmptyState";

/** Loading / error placeholder shown until the library data is ready. Renders nothing once ready. */
export const LibraryLoadState = () => {
  const { status, error, reload } = useLibrary();
  if (status === "loading") return <EmptyState icon="clock" title="Loading books…" message="Fetching the book list." />;
  if (status === "error")
    return (
      <EmptyState
        icon="alert"
        title="Couldn't load the book list"
        message={error}
        action={
          <Button type="button" $variant="secondary" onClick={reload}>
            Try again
          </Button>
        }
      />
    );
  return null;
};
