import { redirect } from "next/navigation";

/* Contact now lives on the home page as one continuous scroll. */
export default function Contact() {
  redirect("/#contact");
}
