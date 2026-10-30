import type { Book } from "../types/book.types";
import { makeIsbn13 } from "../utils/isbn";
import { daysFromToday } from "../utils/date";

/**
 * Sample catalogue for the UI-only phase.
 * `availableCopies` is recalculated from active loans on start-up
 * (see reconcileAvailability in book.service.ts), so it starts equal to totalCopies here.
 */
type SeedBook = Omit<Book, "availableCopies" | "isbn"> & { isbnPrefix?: string };

const seed: SeedBook[] = [
  { id: "BK-1001", title: "Clean Code", author: "Robert C. Martin", isbnPrefix: "978013235088", category: "Technology", publisher: "Prentice Hall", edition: "1st", publicationYear: 2008, totalCopies: 6, shelfNumber: "T-01-A" },
  { id: "BK-1002", title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbnPrefix: "978026204630", category: "Technology", publisher: "MIT Press", edition: "4th", publicationYear: 2022, totalCopies: 8, shelfNumber: "T-01-B" },
  { id: "BK-1003", title: "The Pragmatic Programmer", author: "Andrew Hunt, David Thomas", isbnPrefix: "978013595705", category: "Technology", publisher: "Addison-Wesley", edition: "20th Anniv.", publicationYear: 2019, totalCopies: 4, shelfNumber: "T-01-C" },
  { id: "BK-1004", title: "Design Patterns", author: "Erich Gamma", isbnPrefix: "978020163361", category: "Technology", publisher: "Addison-Wesley", edition: "1st", publicationYear: 1994, totalCopies: 3, shelfNumber: "T-02-A" },
  { id: "BK-1005", title: "Computer Networks", author: "Andrew S. Tanenbaum", isbnPrefix: "978013212695", category: "Technology", publisher: "Pearson", edition: "5th", publicationYear: 2010, totalCopies: 5, shelfNumber: "T-02-B" },
  { id: "BK-1006", title: "Operating System Concepts", author: "Abraham Silberschatz", isbnPrefix: "978111806333", category: "Technology", publisher: "Wiley", edition: "9th", publicationYear: 2012, totalCopies: 6, shelfNumber: "T-02-C" },
  { id: "BK-1007", title: "Database System Concepts", author: "Abraham Silberschatz", isbnPrefix: "978007802215", category: "Technology", publisher: "McGraw-Hill", edition: "6th", publicationYear: 2010, totalCopies: 2, shelfNumber: "T-03-A" },
  { id: "BK-1008", title: "A Brief History of Time", author: "Stephen Hawking", isbnPrefix: "978055338016", category: "Science", publisher: "Bantam", edition: "10th Anniv.", publicationYear: 1998, totalCopies: 5, shelfNumber: "S-01-A" },
  { id: "BK-1009", title: "The Selfish Gene", author: "Richard Dawkins", isbnPrefix: "978019878860", category: "Science", publisher: "Oxford University Press", edition: "40th Anniv.", publicationYear: 2016, totalCopies: 3, shelfNumber: "S-01-B" },
  { id: "BK-1010", title: "Cosmos", author: "Carl Sagan", isbnPrefix: "978034553943", category: "Science", publisher: "Ballantine", edition: "Reprint", publicationYear: 2013, totalCopies: 4, shelfNumber: "S-01-C" },
  { id: "BK-1011", title: "Concepts of Physics Vol. 1", author: "H. C. Verma", isbnPrefix: "978817709187", category: "Science", publisher: "Bharati Bhawan", edition: "2022", publicationYear: 2022, totalCopies: 12, shelfNumber: "S-02-A" },
  { id: "BK-1012", title: "Organic Chemistry", author: "Paula Y. Bruice", isbnPrefix: "978013404228", category: "Science", publisher: "Pearson", edition: "8th", publicationYear: 2016, totalCopies: 5, shelfNumber: "S-02-B" },
  { id: "BK-1013", title: "Higher Engineering Mathematics", author: "B. S. Grewal", isbnPrefix: "978817409195", category: "Mathematics", publisher: "Khanna Publishers", edition: "44th", publicationYear: 2017, totalCopies: 10, shelfNumber: "M-01-A" },
  { id: "BK-1014", title: "Linear Algebra Done Right", author: "Sheldon Axler", isbnPrefix: "978303141025", category: "Mathematics", publisher: "Springer", edition: "4th", publicationYear: 2024, totalCopies: 3, shelfNumber: "M-01-B" },
  { id: "BK-1015", title: "Discrete Mathematics and Its Applications", author: "Kenneth H. Rosen", isbnPrefix: "978125967651", category: "Mathematics", publisher: "McGraw-Hill", edition: "8th", publicationYear: 2018, totalCopies: 6, shelfNumber: "M-01-C" },
  { id: "BK-1016", title: "Pride and Prejudice", author: "Jane Austen", isbnPrefix: "978014143951", category: "Fiction", publisher: "Penguin Classics", edition: "Reprint", publicationYear: 2003, totalCopies: 4, shelfNumber: "F-01-A" },
  { id: "BK-1017", title: "To Kill a Mockingbird", author: "Harper Lee", isbnPrefix: "978006112008", category: "Fiction", publisher: "Harper Perennial", edition: "Reprint", publicationYear: 2006, totalCopies: 5, shelfNumber: "F-01-B" },
  { id: "BK-1018", title: "Nineteen Eighty-Four", author: "George Orwell", isbnPrefix: "978014118776", category: "Fiction", publisher: "Penguin", edition: "Reprint", publicationYear: 2004, totalCopies: 6, shelfNumber: "F-01-C" },
  { id: "BK-1019", title: "The Guide", author: "R. K. Narayan", isbnPrefix: "978818547806", category: "Fiction", publisher: "Indian Thought Publications", edition: "Reprint", publicationYear: 2010, totalCopies: 3, shelfNumber: "F-02-A" },
  { id: "BK-1020", title: "Malgudi Days", author: "R. K. Narayan", isbnPrefix: "978014303965", category: "Fiction", publisher: "Penguin Classics", edition: "Reprint", publicationYear: 2006, totalCopies: 4, shelfNumber: "F-02-B" },
  { id: "BK-1021", title: "The God of Small Things", author: "Arundhati Roy", isbnPrefix: "978014302857", category: "Fiction", publisher: "Penguin", edition: "Reprint", publicationYear: 2002, totalCopies: 2, shelfNumber: "F-02-C" },
  { id: "BK-1022", title: "Gitanjali", author: "Rabindranath Tagore", isbnPrefix: "978812910345", category: "Literature", publisher: "Rupa", edition: "Reprint", publicationYear: 2002, totalCopies: 3, shelfNumber: "L-01-A" },
  { id: "BK-1023", title: "Thirukkural (English Translation)", author: "Thiruvalluvar", isbnPrefix: "978818479218", category: "Literature", publisher: "Sura Books", edition: "Reprint", publicationYear: 2015, totalCopies: 4, shelfNumber: "L-01-B" },
  { id: "BK-1024", title: "Wings of Fire", author: "A. P. J. Abdul Kalam", isbnPrefix: "978817371146", category: "Biography", publisher: "Universities Press", edition: "Reprint", publicationYear: 1999, totalCopies: 8, shelfNumber: "B-01-A" },
  { id: "BK-1025", title: "The Story of My Experiments with Truth", author: "M. K. Gandhi", isbnPrefix: "978817229008", category: "Biography", publisher: "Navajivan", edition: "Reprint", publicationYear: 2015, totalCopies: 5, shelfNumber: "B-01-B" },
  { id: "BK-1026", title: "Steve Jobs", author: "Walter Isaacson", isbnPrefix: "978145164853", category: "Biography", publisher: "Simon & Schuster", edition: "1st", publicationYear: 2011, totalCopies: 2, shelfNumber: "B-01-C" },
  { id: "BK-1027", title: "India After Gandhi", author: "Ramachandra Guha", isbnPrefix: "978033050554", category: "History", publisher: "Picador", edition: "10th Anniv.", publicationYear: 2017, totalCopies: 3, shelfNumber: "H-01-A" },
  { id: "BK-1028", title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", isbnPrefix: "978009959008", category: "History", publisher: "Vintage", edition: "Reprint", publicationYear: 2015, totalCopies: 6, shelfNumber: "H-01-B" },
  { id: "BK-1029", title: "The Discovery of India", author: "Jawaharlal Nehru", isbnPrefix: "978014303103", category: "History", publisher: "Penguin", edition: "Reprint", publicationYear: 2008, totalCopies: 4, shelfNumber: "H-01-C" },
  { id: "BK-1030", title: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki", isbnPrefix: "978161268019", category: "Business", publisher: "Plata Publishing", edition: "2nd", publicationYear: 2017, totalCopies: 5, shelfNumber: "BU-01-A" },
  { id: "BK-1031", title: "Zero to One", author: "Peter Thiel", isbnPrefix: "978080413929", category: "Business", publisher: "Crown Business", edition: "1st", publicationYear: 2014, totalCopies: 3, shelfNumber: "BU-01-B" },
  { id: "BK-1032", title: "Oxford Advanced Learner's Dictionary", author: "A. S. Hornby", isbnPrefix: "978019479848", category: "Reference", publisher: "Oxford University Press", edition: "10th", publicationYear: 2020, totalCopies: 2, shelfNumber: "R-01-A" },
];

export const mockBooks: Book[] = seed.map(({ isbnPrefix, ...book }, index) => ({
  ...book,
  isbn: isbnPrefix ? makeIsbn13(isbnPrefix) : undefined,
  availableCopies: book.totalCopies,
  createdAt: daysFromToday(-180 + index),
}));
