import { createContext, useContext, useState, ReactNode } from "react";

export type KnowledgeCategory = "letter" | "color" | "animal" | "plant" | "food" | "shape";

export interface KnowledgePoint {
  category: KnowledgeCategory;
  topic: string;
  words: string[];
  color: string;
  emoji: string;
}

export type CourseContent = "animation" | "story" | "nursery";

export interface CoursePlan {
  content1: CourseContent;
  content2: CourseContent;
}

export const KNOWLEDGE_POINTS: KnowledgePoint[] = [
  // Letters
  { category: "letter", topic: "C", words: ["Cat", "Car", "Cake", "Cup", "Cow"], color: "#60A5FA", emoji: "🔤" },
  { category: "letter", topic: "B", words: ["Ball", "Bear", "Bee", "Bird", "Bus"], color: "#10B981", emoji: "🔤" },
  { category: "letter", topic: "D", words: ["Dog", "Duck", "Deer", "Door", "Drum"], color: "#F59E0B", emoji: "🔤" },
  // Colors
  { category: "color", topic: "Red", words: ["Apple", "Fire truck", "Strawberry", "Tomato", "Rose"], color: "#EF4444", emoji: "🔴" },
  { category: "color", topic: "Blue", words: ["Sky", "Ocean", "Blueberry", "Whale", "Rain"], color: "#3B82F6", emoji: "🔵" },
  { category: "color", topic: "Green", words: ["Grass", "Tree", "Frog", "Leaf", "Turtle"], color: "#22C55E", emoji: "🟢" },
  // Animals
  { category: "animal", topic: "Farm Animals", words: ["Cow", "Pig", "Chicken", "Horse", "Sheep"], color: "#F59E0B", emoji: "🐄" },
  { category: "animal", topic: "Ocean Animals", words: ["Fish", "Whale", "Dolphin", "Turtle", "Octopus"], color: "#06B6D4", emoji: "🐬" },
  // Plants
  { category: "plant", topic: "Flowers", words: ["Rose", "Sunflower", "Tulip", "Daisy", "Lily"], color: "#EC4899", emoji: "🌸" },
  { category: "plant", topic: "Trees", words: ["Oak", "Pine", "Maple", "Palm", "Willow"], color: "#16A34A", emoji: "🌳" },
  // Food
  { category: "food", topic: "Fruits", words: ["Apple", "Banana", "Orange", "Grape", "Watermelon"], color: "#F97316", emoji: "🍎" },
  { category: "food", topic: "Vegetables", words: ["Carrot", "Broccoli", "Corn", "Potato", "Pumpkin"], color: "#84CC16", emoji: "🥕" },
  // Shapes
  { category: "shape", topic: "Shapes", words: ["Circle", "Square", "Triangle", "Star", "Heart"], color: "#A855F7", emoji: "🔷" },
];

function planCourse(): CoursePlan {
  const allContents: CourseContent[] = ["animation", "story", "nursery"];
  const shuffled = [...allContents].sort(() => Math.random() - 0.5);
  return { content1: shuffled[0], content2: shuffled[1] };
}

interface LearningContextType {
  todayKnowledge: KnowledgePoint | null;
  setTodayKnowledge: (knowledge: KnowledgePoint) => void;
  coursePlan: CoursePlan | null;
  setCoursePlan: (plan: CoursePlan) => void;
  selectedScene: string | null;
  setSelectedScene: (scene: string) => void;
  initializeLesson: () => void;
}

const LearningContext = createContext<LearningContextType | null>(null);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [todayKnowledge, setTodayKnowledge] = useState<KnowledgePoint | null>(null);
  const [coursePlan, setCoursePlan] = useState<CoursePlan | null>(null);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  const initializeLesson = () => {
    const randomKnowledge = KNOWLEDGE_POINTS[Math.floor(Math.random() * KNOWLEDGE_POINTS.length)];
    setTodayKnowledge(randomKnowledge);
    setCoursePlan(planCourse());
  };

  return (
    <LearningContext.Provider
      value={{
        todayKnowledge,
        setTodayKnowledge,
        coursePlan,
        setCoursePlan,
        selectedScene,
        setSelectedScene,
        initializeLesson,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used within a LearningProvider");
  }
  return context;
}
