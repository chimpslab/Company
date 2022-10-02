import mongoose from "mongoose";


export enum ERoles {
  superadmin = "superadmin",
  admin = "administrator",
  editor = "editor",
  reader = "reader",
  userProfile = "userprofile",
  disabled = "disabled"
}
export type RoleDocument = mongoose.Document & {
  name: string;

  capabilites: {
      edit_any_options: false,
      edit_system_options: false,
      manage_plugins: false,
      manage_backups: false,

      manage_widgets: false,

      bugreport: true,
      send_messages: true,

      manage_contacts: false,
      manage_organizations: false,

      manage_roles: false,
      manage_user_invitations: false,
      manage_other_users: false,
      manage_own_profile: true,
      manage_own_delete: true,
  }
};

const RoleDocumentSchema = new mongoose.Schema({
  name: {type: String, unique: true}
});

export const Role = mongoose.model<RoleDocument>("Role", RoleDocumentSchema);
