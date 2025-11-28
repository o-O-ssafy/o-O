import { useState } from 'react';

export type Permission = "can View" | "can Edit";
export type Role = "Viewer" | "Editor" | "Maintainer";
export type Collaborator = {
  id: string;
  name: string;
  avatar: string;
  role: Role;
  permission?: Permission;
};

export const useCollaborators = (initialCollaborators: Collaborator[]) => {
  const [collaborators, setCollaborators] = useState(initialCollaborators);

  const handlePermissionChange = (userId: string, newPermission: Permission) => {
    setCollaborators((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              permission: newPermission,
              role: newPermission === "can Edit" ? "Editor" : "Viewer",
            }
          : user
      )
    );
  };

  return {
    collaborators,
    handlePermissionChange,
  };
};
