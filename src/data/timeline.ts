// 时间线数据配置文件
// 用于管理时间线页面的数据

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  type: "education" | "work" | "project" | "achievement";
  startDate: string;
  endDate?: string; // If empty, it means current
  location?: string;
  organization?: string;
  position?: string;
  skills?: string[];
  achievements?: string[];
  links?: {
    name: string;
    url: string;
    type: "website" | "certificate" | "project" | "other";
  }[];
  icon?: string; // Iconify icon name
  color?: string;
  featured?: boolean;
}

export const timelineData: TimelineItem[] = [
  {
    id: "current-study",
    title: "某知名大学计算机专业在读",
    description:
      "[演示数据] 目前正在攻读计算机科学与技术专业，专注于全栈开发和人工智能方向。",
    type: "education",
    startDate: "2022-09-01",
    location: "某一线城市",
    organization: "某知名理工大学",
    skills: ["Java", "Python", "JavaScript", "HTML/CSS", "MySQL"],
    achievements: [
      "当前GPA：3.8/4.0（虚拟数据）",
      "完成多个算法和数据结构项目",
      "参与校内创新创业项目",
    ],
    icon: "material-symbols:school",
    color: "#059669",
    featured: true,
  },
  {
    id: "firefly-blog-project",
    title: "开源博客主题项目",
    description:
      "[演示项目] 基于现代前端框架开发的博客主题，支持多种功能和定制选项。",
    type: "project",
    startDate: "2024-06-01",
    endDate: "2024-08-01",
    skills: ["Astro", "TypeScript", "Tailwind CSS", "Git"],
    achievements: [
      "获得GitHub 500+ stars（虚拟数据）",
      "实现完整的响应式设计",
      "支持多语言和主题切换",
    ],
    links: [
      {
        name: "GitHub 仓库",
        url: "https://github.com/example/demo-blog",
        type: "project",
      },
      {
        name: "在线演示",
        url: "https://demo-blog.example.com",
        type: "website",
      },
    ],
    icon: "material-symbols:code",
    color: "#7C3AED",
    featured: true,
  },
  {
    id: "summer-internship-2024",
    title: "知名互联网公司实习",
    description:
      "[演示经历] 在某知名互联网公司担任前端开发实习生，参与核心产品开发。",
    type: "work",
    startDate: "2024-07-01",
    endDate: "2024-08-31",
    location: "某一线城市",
    organization: "某知名互联网公司",
    position: "前端开发实习生",
    skills: ["React", "JavaScript", "CSS3", "Git", "Figma"],
    achievements: [
      "负责用户量10万+产品的UI组件开发（虚拟数据）",
      "参与代码审查和技术分享",
      "获得部门优秀实习生称号",
    ],
    icon: "material-symbols:work",
    color: "#DC2626",
    featured: true,
  },
  {
    id: "web-development-course",
    title: "全栈开发认证课程",
    description:
      "[演示成就] 完成知名在线教育平台的全栈开发认证课程，获得专业认证。",
    type: "achievement",
    startDate: "2024-01-15",
    endDate: "2024-05-30",
    organization: "某知名在线教育平台",
    skills: ["HTML", "CSS", "JavaScript", "Node.js", "Express"],
    achievements: [
      "获得专业认证证书（98分/100分）",
      "完成8个综合实战项目",
      "掌握现代全栈开发技术栈",
    ],
    links: [
      {
        name: "认证证书",
        url: "https://demo-certificates.example.com/fullstack",
        type: "certificate",
      },
    ],
    icon: "material-symbols:verified",
    color: "#059669",
  },
  {
    id: "student-management-system",
    title: "企业级管理系统项目",
    description:
      "[演示项目] 开发了一套完整的企业级管理系统，包含用户管理、权限控制等功能。",
    type: "project",
    startDate: "2023-11-01",
    endDate: "2023-12-15",
    skills: ["Java", "MySQL", "Spring Boot", "Vue.js"],
    achievements: [
      "获得课程项目一等奖（虚拟荣誉）",
      "支持1000+并发用户访问",
      "实现完整的权限管理系统",
    ],
    icon: "material-symbols:database",
    color: "#EA580C",
  },
  {
    id: "programming-contest",
    title: "ACM程序设计竞赛",
    description:
      "[演示成就] 参加国际大学生程序设计竞赛，在算法和编程方面取得优异成绩。",
    type: "achievement",
    startDate: "2023-10-20",
    location: "某知名大学",
    organization: "ACM竞赛组委会",
    skills: ["C++", "算法设计", "数据结构", "数学建模"],
    achievements: [
      "获得区域赛银奖（虚拟荣誉）",
      "解决复杂算法问题15道",
      "团队协作能力显著提升",
    ],
    icon: "material-symbols:emoji-events",
    color: "#7C3AED",
  },
  {
    id: "part-time-tutor",
    title: "在线编程讲师",
    description:
      "[演示经历] 在知名在线教育平台担任编程讲师，为学员提供高质量的编程教学。",
    type: "work",
    startDate: "2023-09-01",
    endDate: "2024-01-31",
    position: "高级编程讲师",
    skills: ["Python", "Java", "教学设计", "课程开发"],
    achievements: [
      "累计教学学员500+人次（虚拟数据）",
      "课程好评率达到98%",
      "开发原创教学课程3套",
    ],
    icon: "material-symbols:school",
    color: "#059669",
  },
  {
    id: "high-school-graduation",
    title: "重点高中毕业",
    description:
      "[演示学历] 以优异成绩从省重点高中毕业，成功考入知名理工大学计算机专业。",
    type: "education",
    startDate: "2019-09-01",
    endDate: "2022-06-30",
    location: "某省会城市",
    organization: "某省重点中学",
    achievements: [
      "高考成绩：全省前1%（虚拟数据）",
      "获得省级优秀学生干部称号",
      "全国数学竞赛一等奖",
    ],
    icon: "material-symbols:school",
    color: "#2563EB",
  },
  {
    id: "first-programming-experience",
    title: "首次接触编程",
    description: "在高中信息技术课上首次接触编程，开始学习Python基础语法。",
    type: "education",
    startDate: "2021-03-01",
    skills: ["Python", "编程基础概念"],
    achievements: [
      '完成第一个"Hello World"程序',
      "学会基本循环和条件语句",
      "培养对编程的兴趣",
    ],
    icon: "material-symbols:code",
    color: "#7C3AED",
  },
];

// 获取时间线统计信息
export const getTimelineStats = () => {
  const total = timelineData.length;
  const byType = {
    education: timelineData.filter((item) => item.type === "education").length,
    work: timelineData.filter((item) => item.type === "work").length,
    project: timelineData.filter((item) => item.type === "project").length,
    achievement: timelineData.filter((item) => item.type === "achievement")
      .length,
  };

  return { total, byType };
};

// 根据类型获取时间线项目
export const getTimelineByType = (type?: string) => {
  if (!type || type === "all") {
    return timelineData.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }
  return timelineData
    .filter((item) => item.type === type)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
};

// 获取精选时间线项目
export const getFeaturedTimeline = () => {
  return timelineData
    .filter((item) => item.featured)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
};

// 获取当前进行中的项目
export const getCurrentItems = () => {
  return timelineData.filter((item) => !item.endDate);
};

// 计算总工作经验
export const getTotalWorkExperience = () => {
  const workItems = timelineData.filter((item) => item.type === "work");
  let totalMonths = 0;

  workItems.forEach((item) => {
    const startDate = new Date(item.startDate);
    const endDate = item.endDate ? new Date(item.endDate) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    totalMonths += diffMonths;
  });

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
  };
};
