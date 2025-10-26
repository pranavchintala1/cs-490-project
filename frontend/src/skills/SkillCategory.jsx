import React from "react";
import SkillItem from "./SkillItem";

// UC-27: Category container just renders the SkillItem
export default function SkillCategory({ skill, updateSkill, removeSkill }) {
  return (
    <SkillItem
      skill={skill}
      updateSkill={updateSkill}
      removeSkill={removeSkill}
    />
  );
}
