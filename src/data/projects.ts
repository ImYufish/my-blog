// 项目数据配置文件
// 用于管理项目展示页面的数据

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: "web" | "mobile" | "desktop" | "other";
  techStack: string[];
  status: "completed" | "in-progress" | "planned";
  liveDemo?: string;
  sourceCode?: string;
  startDate: string;
  endDate?: string;
  featured?: boolean;
  tags?: string[];
}

export const projectsData: Project[] = [
  {
    id: "firefly-blog",
    title: "Firefly 博客主题",
    description:
      "基于 Astro 框架开发的现代化博客主题，支持多语言、暗色模式和响应式设计等功能。",
    image: "",
    category: "web",
    techStack: ["Astro", "TypeScript", "Tailwind CSS", "Svelte"],
    status: "completed",
    liveDemo: "https://blog.example.com",
    sourceCode: "https://github.com/Cuteleaf/Firefly",
    startDate: "2024-01-01",
    endDate: "2024-06-01",
    featured: true,
    tags: ["博客", "主题", "开源"],
  },
  {
    id: "portfolio-website",
    title: "个人作品集网站",
    description: "展示项目经验和技术技能的个人作品集网站。",
    image: "",
    category: "web",
    techStack: ["React", "Next.js", "TypeScript", "Framer Motion"],
    status: "completed",
    liveDemo: "https://portfolio.example.com",
    sourceCode: "https://github.com/example/portfolio",
    startDate: "2023-09-01",
    endDate: "2023-12-01",
    featured: true,
    tags: ["作品集", "React", "动画"],
  },
  {
    id: "task-manager-app",
    title: "任务管理应用",
    description: "支持团队协作和项目管理的跨平台任务管理应用程序。",
    image: "",
    category: "mobile",
    techStack: ["React Native", "TypeScript", "Redux", "Firebase"],
    status: "in-progress",
    startDate: "2024-03-01",
    tags: ["移动应用", "效率工具", "团队协作"],
  },
  {
    id: "data-visualization-tool",
    title: "数据可视化工具",
    description: "支持多种图表类型和交互式分析的数据可视化工具。",
    image: "",
    category: "web",
    techStack: ["Vue.js", "D3.js", "TypeScript", "Node.js"],
    status: "planned",
    liveDemo: "https://dataviz.example.com",
    startDate: "2023-06-01",
    endDate: "2023-11-01",
    tags: ["数据可视化", "分析工具", "图表"],
  },
];

// 获取项目统计信息
export const getProjectStats = () => {
  const total = projectsData.length;
  const completed = projectsData.filter((p) => p.status === "completed").length;
  const inProgress = projectsData.filter(
    (p) => p.status === "in-progress"
  ).length;
  const planned = projectsData.filter((p) => p.status === "planned").length;

  return {
    total,
    byStatus: {
      completed,
      inProgress,
      planned,
    },
  };
};

// 根据分类获取项目
export const getProjectsByCategory = (category?: string) => {
  if (!category || category === "all") {
    return projectsData;
  }
  return projectsData.filter((p) => p.category === category);
};

// 获取精选项目
export const getFeaturedProjects = () => {
  return projectsData.filter((p) => p.featured);
};

// 获取所有技术栈
export const getAllTechStack = () => {
  const techSet = new Set<string>();
  projectsData.forEach((project) => {
    project.techStack.forEach((tech) => techSet.add(tech));
  });
  return Array.from(techSet).sort();
};
