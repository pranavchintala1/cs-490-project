import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SkillItem from "./SkillItem";

export function SortableItem({ skill, updateSkill, removeSkill }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1, // hide while dragging
    marginBottom: "5px",
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SkillItem skill={skill} updateSkill={updateSkill} removeSkill={removeSkill} />
    </li>
  );
}
