import { Redirect } from "expo-router";

// This screen doesn't render — the tab button opens the modal directly
export default function AddScreen() {
  return <Redirect href="/" />;
}
