export interface Collaborator {
  name: string;
  image?: string;
}

export interface Project {
  id: string;
  title: string;
  date: string;
  isPrivate: boolean;
  thumbnail?: string;
  collaborators: Collaborator[];
}
