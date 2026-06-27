import { ProfileSettings } from "@/components/profile/profile-settings";

export const metadata = {
  title: "My Profile",
};

export default function AdminProfilePage() {
  return <ProfileSettings rolePath="/admin" title="My profile" />;
}
