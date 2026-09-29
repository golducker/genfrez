import { redirect } from "next/navigation";

/* About now lives on the home page as one continuous scroll. */
export default function About() {
  redirect("/#about");
}
