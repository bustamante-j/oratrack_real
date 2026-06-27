import { ProfileSettings } from "@/components/profile/profile-settings";

export const metadata = {
  title: "My Profile",
};

export default function TeacherProfilePage() {
  return <ProfileSettings rolePath="/teacher" title="My profile" />;
}
