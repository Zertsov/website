"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Code,
  Briefcase,
  GraduationCap,
  FileText,
  Star,
  Calendar,
  Building,
  Zap,
  Target,
  Cloud,
  Shield,
  Database,
  Cpu,
} from "lucide-react"

const technologies = [
  { name: "Golang", icon: "🐹", color: "bg-blue-100 text-blue-800" },
  { name: "JavaScript", icon: "⚡", color: "bg-yellow-100 text-yellow-800" },
  { name: "Python", icon: "🐍", color: "bg-green-100 text-green-800" },
  { name: "React", icon: "⚛️", color: "bg-cyan-100 text-cyan-800" },
  { name: "Node.js", icon: "🟢", color: "bg-emerald-100 text-emerald-800" },
  { name: "Vue", icon: "💚", color: "bg-teal-100 text-teal-800" },
  { name: "Kubernetes", icon: "☸️", color: "bg-purple-100 text-purple-800" },
]

const interests = [
  "Cloud computing",
  "Visibility/alerting",
  "Golang",
  "Security",
  "DevExp",
  "Open source software",
  "New technologies",
  "Design patterns",
  "Learning",
]

const experiences = [
  {
    title: "Software Engineer",
    company: "Cloudflare",
    period: "Mar 2021 - present",
    description:
      "Building Cloudflare's edge deployment platform. Lead fullstack engineer (Go/Vue). First engineer hired to work on Cloudflare's new edge release platform. Leading efforts to increase developer productivity while making edge releases safer for the company. Led multiple feature implementations and garnered customer feedback to ensure we made changes our users wanted.",
    icon: <Cloud className="w-5 h-5" />,
    color: "bg-orange-500",
  },
  {
    title: "Senior Software Engineer",
    company: "Visa",
    period: "Jan 2020 - Mar 2021",
    description:
      "Working on making an easy and reliable Kubernetes facade to help migration from virtual machines to containers. Lead Go/Vue engineer. Led implementation of a new feature to reduce deploy times by over 2 months. Led design of our new home-grown CI/CD pipeline and gathered customer feedback to ensure we were designing the right thing for the right people.",
    icon: <Briefcase className="w-5 h-5" />,
    color: "bg-blue-600",
  },
  {
    title: "Senior Software Engineer",
    company: "Target",
    period: "Jul 2017 - Jan 2020",
    description:
      "Stood up a new SRE team and developed in-house dependency graph. Designed Croupier (see Projects below), led a team of 3 engineers and taught team of 3 engineers how to write enterprise-ready code.",
    icon: <Target className="w-5 h-5" />,
    color: "bg-red-500",
  },
  {
    title: "Cloud Infrastructure Software Engineer",
    company: "Target",
    period: "Aug 2018 - May 2019",
    description:
      "Built a Spring-Boot like framework for Go and infra visibility tooling. Wrote libraries for Go developers to easily hook into any Target related cloud infrastructure to reduce friction between developers and infra. Worked on compiled Go code to be run inside JavaScript via shared object file compilation, among other dev tooling.",
    icon: <Database className="w-5 h-5" />,
    color: "bg-red-500",
  },
  {
    title: "Cloud Security Software Engineer",
    company: "Target",
    period: "Feb 2018 - Aug 2018",
    description:
      "Developed a multitude of tools to aid in our cloud security efforts. Worked on Softcell and Bifrost, both Go applications and converted Security Monkey (Python based) from AWS based to GCP based.",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-red-500",
  },
  {
    title: "Point Of Sale Software Engineer",
    company: "Target",
    period: "Jul 2017 - Feb 2018",
    description:
      "Modernization efforts (Legacy C++ to JavaScript/Java microservices). Converted sections of monolithic C++ app to Java-based microservices, wrote the beginning of the new Target cash register UI (the one you see in stores today) in JS/React, and added features to the C++ monolith.",
    icon: <Cpu className="w-5 h-5" />,
    color: "bg-red-500",
  },
]

const projects = [
  {
    name: "Release Manager",
    company: "Cloudflare",
    description:
      "Cloudflare's release platform. Handles deploying almost all of Cloudflare's services to the edge and allows for quick and easy rollbacks in the event of failures. Developed multiple features, including our fast emergency rollout, custom deployment plans, and automatic token issuance (among others).",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    name: "Triton",
    company: "Visa",
    description:
      "Worked on improving speed and quality of the core system code for our Kubernetes facade, and implemented the beginnings of a service discovery API to ease managing dependencies within a developer's codebase.",
    icon: <Database className="w-5 h-5" />,
  },
  {
    name: "Dexmap",
    company: "Target",
    description:
      "Developed a system to graph high business impact apps to all services they depend on. Includes performance for each node on the graph to indicate which service is causing issues at a glance.",
    icon: <Target className="w-5 h-5" />,
  },
  {
    name: "Croupier",
    company: "Target",
    description:
      "Designed a full-stack app that collected metrics from every container in the Kubernetes-at-the-edge and found non-performant apps that impacted our cloud. Handles 5.5M metrics every 15 minutes and reports on performance.",
    icon: <Cpu className="w-5 h-5" />,
  },
  {
    name: "Softcell",
    company: "Target",
    description: "Kubernetes monitor that deletes pods that have been SSH'd into, with customizable time-to-kill.",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    name: "Bifrost",
    company: "Target",
    description: "Worked on Target's in-house SSH jailer / jump host.",
    icon: <Shield className="w-5 h-5" />,
  },
]

export default function Resume() {
  const [activeSection, setActiveSection] = useState("about")
  const [hoveredTech, setHoveredTech] = useState < string | null > (null)
  const [typedText, setTypedText] = useState("")
  const fullText = "Software Engineer and all around tech nerd"

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 100)
    return () => clearInterval(timer)
  }, [])

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <motion.h1
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                Mitch Vostrez
              </motion.h1>
              <p className="text-lg text-gray-600 mt-2 h-8">
                {typedText}
                <span className="animate-pulse">|</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              {["about", "experience", "projects", "contact"].map((section) => (
                <Button
                  key={section}
                  variant={activeSection === section ? "default" : "outline"}
                  onClick={() => setActiveSection(section)}
                  className="capitalize"
                >
                  {section}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeSection === "about" && (
            <motion.div
              key="about"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              {/* Contact Info */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <span>5808 Needlenook Court, Austin, TX</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <a href="mailto:mitch@voz.dev" className="text-blue-600 hover:underline">
                        mitch@voz.dev
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-500" />
                      <span>402-200-0642</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Linkedin className="w-5 h-5 text-blue-500" />
                      <a href="https://linkedin.com/in/mitch-vostrez/" className="text-blue-600 hover:underline">
                        linkedin.com/in/mitch-vostrez/
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technologies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Technologies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {technologies.map((tech, index) => (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        onHoverStart={() => setHoveredTech(tech.name)}
                        onHoverEnd={() => setHoveredTech(null)}
                      >
                        <Badge className={`${tech.color} text-lg px-4 py-2 cursor-pointer`}>
                          <span className="mr-2">{tech.icon}</span>
                          {tech.name}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  {hoveredTech && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-gray-600">
                      Hovering over: {hoveredTech}
                    </motion.p>
                  )}
                </CardContent>
              </Card>

              {/* Interests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Interests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest, index) => (
                      <motion.span
                        key={interest}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {interest}
                      </motion.span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">B.S. Computer Science</h3>
                      <p className="text-gray-600">University of Nebraska-Lincoln</p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      2013-2017
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Publication */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Publication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic">
                    "A cognitive radio TV prototype for effective TV spectrum sharing"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === "experience" && (
            <motion.div
              key="experience"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Briefcase className="w-8 h-8" />
                Experience
              </h2>
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${exp.color} text-white`}>{exp.icon}</div>
                          <div>
                            <CardTitle className="text-xl">{exp.title}</CardTitle>
                            <p className="text-lg font-medium text-gray-600">{exp.company}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {exp.period}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeSection === "projects" && (
            <motion.div
              key="projects"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Building className="w-8 h-8" />
                Projects
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full text-blue-600">{project.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{project.name}</CardTitle>
                            <p className="text-sm text-gray-500">{project.company}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 text-sm leading-relaxed">{project.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === "contact" && (
            <motion.div
              key="contact"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="max-w-2xl mx-auto"
            >
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-3xl mb-4">Let's Connect!</CardTitle>
                  <p className="text-gray-600">Interested in working together? I'd love to hear from you.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <motion.a
                      href="mailto:mitch@voz.dev"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Email Me</span>
                    </motion.a>
                    <motion.a
                      href="https://linkedin.com/in/mitch-vostrez/"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">LinkedIn</span>
                    </motion.a>
                  </div>
                  <Separator />
                  <div className="text-sm text-gray-500">
                    <p>📍 Austin, TX</p>
                    <p>📞 402-200-0642</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <motion.div className="fixed bottom-8 right-8" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑ Top
        </Button>
      </motion.div>
    </div>
  )
}
