export type Step = "welcome" | "dbtype" | "dbconfig" | "database" | "admin" | "store" | "done";

export type DbType = "sqlite" | "postgresql";

export interface AdminForm {
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface StoreForm {
  name: string;
  tagline: string;
  phone: string;
}
