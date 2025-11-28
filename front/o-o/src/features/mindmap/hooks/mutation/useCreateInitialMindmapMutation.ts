import { useMutation } from "@tanstack/react-query";
import {
  type InitialMindmapRequestDTO,
  type InitialMindmapResponseDTO,
} from "@/services/dto/mindmap.dto";
import { createInitialMindmap, createInitialMindmapFromImage } from "@/services/mindmapService";

export const useCreateInitialMindmapMutation = () =>
  useMutation<
    InitialMindmapResponseDTO,
    unknown,
    InitialMindmapRequestDTO
  >({
    mutationKey: ["mindmap", "createInitial"],
    mutationFn: (request) => createInitialMindmap(request),
  });

export const useCreateInitialMindmapFromImageMutation = () =>
  useMutation<
    InitialMindmapResponseDTO,
    unknown,
    { file: File; startPrompt: string | null }
  >({
    mutationKey: ["mindmap", "createInitialFromImage"],
    mutationFn: ({ file, startPrompt }) => createInitialMindmapFromImage(file, startPrompt),
  });
