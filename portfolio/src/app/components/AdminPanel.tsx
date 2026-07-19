'use client';

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface Skill {
    _id: string;
    title: string;
    startedLearning: string;
    icon: string;
}

interface Project {
    _id: string;
    title: string;
    repoUrl: string;
    coverImage: string;
    description?: string;
}

interface GithubRepo {
    id: number;
    name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    language: string | null;
    fork: boolean;
    updated_at: string;
}


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/skills`;
const PROJECTS_API_URL = `${API_BASE_URL}/api/projects`;
const GITHUB_API_URL = `${API_BASE_URL}/api/github-repos`;

export const AdminPanel = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [name, setName] = useState("");
    const [startedLearning, setStartedLearning] = useState("");
    const [icon, setIcon] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [repos, setRepos] = useState<GithubRepo[]>([]);
    const [isReposLoading, setIsReposLoading] = useState(true);
    const [reposError, setReposError] = useState<string | null>(null);

    const [projects, setProjects] = useState<Project[]>([]);
    const [isProjectsLoading, setIsProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState<string | null>(null);
    const [isProjectSubmitting, setIsProjectSubmitting] = useState(false);
    const [selectedRepoUrl, setSelectedRepoUrl] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [projectDescription, setProjectDescription] = useState("");

    const fetchRepos = useCallback(async () => {
        setIsReposLoading(true);
        setReposError(null);
        try {
            const response = await axios.get<GithubRepo[]>(GITHUB_API_URL);
            setRepos(response.data);
        } catch (err) {
            console.error(err);
            setReposError("Could not load GitHub projects. Make sure the server is running and that GITHUB_TOKEN is set in your environment.");
        } finally {
            setIsReposLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRepos();
    }, [fetchRepos]);

    const fetchProjects = useCallback(async () => {
        setIsProjectsLoading(true);
        setProjectsError(null);
        try {
            const response = await axios.get<Project[]>(PROJECTS_API_URL);
            setProjects(response.data);
        } catch (err) {
            console.error(err);
            setProjectsError("Could not load featured projects.");
        } finally {
            setIsProjectsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedRepoUrl || !coverImage.trim()) return;

        const repo = repos.find((r) => r.html_url === selectedRepoUrl);
        if (!repo) return;

        setIsProjectSubmitting(true);
        try {
            const response = await axios.post<Project>(PROJECTS_API_URL, {
                title: repo.name,
                repoUrl: selectedRepoUrl,
                coverImage,
                description: projectDescription,
            });
            setProjects((prev) => [...prev, response.data]);
            setSelectedRepoUrl("");
            setCoverImage("");
            setProjectDescription("");
        } catch (err) {
            console.error(err);
            setProjectsError("Could not add the project.");
        } finally {
            setIsProjectSubmitting(false);
        }
    };

    const handleDeleteProject = async (id: string) => {
        try {
            setProjects((prev) => prev.filter((project) => project._id !== id));
            await axios.delete(`${PROJECTS_API_URL}/${id}`);
        } catch (err) {
            console.error(err);
            setProjectsError("Could not delete the project.");
            fetchProjects();
        }
    };

    const fetchSkills = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get<Skill[]>(API_URL);
            setSkills(response.data);
        } catch (err) {
            console.error(err);
            setError("Could not load the skills list.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim() || !startedLearning) return;

        setIsSubmitting(true);
        try {
            const response = await axios.post<Skill>(API_URL, {
                title: name,
                startedLearning,
                icon,
            });
            setSkills((prev) => [...prev, response.data]);
            setName("");
            setStartedLearning("");
            setIcon("");
        } catch (err) {
            console.error(err);
            setError("Could not add the skill.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setSkills((prev) => prev.filter((skill) => skill._id !== id));
            await axios.delete(`${API_URL}/${id}`);
        } catch (err) {
            console.error(err);
            setError("Could not delete the skill.");
            fetchSkills(); 
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] text-[#141414] px-6 py-16 font-[Georgia,serif]">
            <div className="mx-auto max-w-2xl">
                <header className="mb-10">
                    <h1 className="text-3xl font-normal tracking-tight">Admin Panel</h1>
                </header>
                <form
                    onSubmit={handleSubmit}
                    className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto_auto]"
                >
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Skill name"
                        required
                        className="rounded border border-[#E4E4E1] bg-white/70 px-3 py-2 font-[Georgia,serif] text-base placeholder:text-[#9A9A94] focus:outline-none focus:border-[#141414]"
                    />
                    <input
                        type="date"
                        value={startedLearning}
                        onChange={(e) => setStartedLearning(e.target.value)}
                        required
                        className="rounded border border-[#E4E4E1] bg-white/70 px-3 py-2 font-mono text-sm text-[#141414] focus:outline-none focus:border-[#141414]"
                    />
                    <input
                        type="text"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="Icon"
                        className="rounded border border-[#E4E4E1] bg-white/70 px-3 py-2 font-[Georgia,serif] text-base placeholder:text-[#9A9A94] focus:outline-none focus:border-[#141414] sm:w-24"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="border border-[#141414] bg-[#141414] px-5 py-2 font-mono text-xs uppercase tracking-widest text-[#FAFAF8] transition-colors hover:bg-[#FAFAF8] hover:text-[#141414] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isSubmitting ? "..." : "Add"}
                    </button>
                </form>

                <section>
                    <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">
                        Added skills {!isLoading && `(${skills.length})`}
                    </p>

                    {isLoading ? (
                        <p className="font-mono text-sm text-[#6B6B6B]">Loading...</p>
                    ) : skills.length === 0 ? (
                        <p className="font-mono text-sm text-[#6B6B6B]">No skills yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {skills.map((skill, index) => (
                                <li
                                    key={skill._id}
                                    className="group flex items-center justify-between gap-4 rounded border border-[#E4E4E1] bg-white/70 px-4 py-4"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        {skill.icon && (
                                            <img
                                                src={skill.icon}
                                                alt=""
                                                className="h-7 w-7 shrink-0 object-contain grayscale"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                                }}
                                            />
                                        )}
                                        <div className="min-w-0">
                                            <strong className="block truncate text-lg font-normal">
                                                {skill.title}
                                            </strong>
                                            <span className="font-mono text-xs text-[#9A9A94]">
                                                from {skill.startedLearning}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(skill._id)}
                                        className="border border-transparent px-3 py-1 font-mono text-xs uppercase tracking-widest text-[#9A9A94] transition-all hover:border-[#141414] hover:text-[#141414]"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="mt-16">
                    <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">
                        Projects {!isProjectsLoading && `(${projects.length})`}
                    </p>

                    <form
                        onSubmit={handleAddProject}
                        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-[1.2fr_1fr_auto]"
                    >
                        <select
                            value={selectedRepoUrl}
                            onChange={(e) => setSelectedRepoUrl(e.target.value)}
                            required
                            className="rounded border border-[#E4E4E1] bg-white/70 px-3 py-2 font-mono text-sm focus:outline-none focus:border-[#141414]"
                        >
                            <option value="" disabled>
                                Repository
                            </option>
                            {repos.map((repo) => (
                                <option key={repo.id} value={repo.html_url}>
                                    {repo.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="Preview URL"
                            required
                            className="rounded border border-[#E4E4E1] bg-white/70 px-3 py-2 font-[Georgia,serif] text-base placeholder:text-[#9A9A94] focus:outline-none focus:border-[#141414]"
                        />
                        <button
                            type="submit"
                            disabled={isProjectSubmitting}
                            className="border border-[#141414] bg-[#141414] px-5 py-2 font-mono text-xs uppercase tracking-widest text-[#FAFAF8] transition-colors hover:bg-[#FAFAF8] hover:text-[#141414] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isProjectSubmitting ? "..." : "Add"}
                        </button>
                        <input
                            type="text"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            placeholder="Description"
                            className="rounded border border-[#E4E4E1] bg-white/70 px-3 py-2 font-[Georgia,serif] text-base placeholder:text-[#9A9A94] focus:outline-none focus:border-[#141414] sm:col-span-2"
                        />
                    </form>

                    {projectsError && (
                        <p className="mb-6 border border-[#141414] px-4 py-2 font-mono text-xs text-[#141414]">
                            {projectsError}
                        </p>
                    )}

                    {isProjectsLoading ? (
                        <p className="font-mono text-sm text-[#6B6B6B]">Loading...</p>
                    ) : projects.length === 0 ? (
                        <p className="font-mono text-sm text-[#6B6B6B]">No projects yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {projects.map((project) => (
                                <div key={project._id} className="group overflow-hidden rounded border border-[#E4E4E1] bg-white/80">
                                    <div className="aspect-video w-full overflow-hidden border-b border-[#141414] bg-[#F0F0EC]">
                                        <img
                                            src={project.coverImage}
                                            alt={project.title}
                                            className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <a
                                                href={project.repoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-lg font-normal text-[#141414] transition-colors hover:text-[#6B6B6B]"
                                            >
                                                {project.title}
                                            </a>
                                            <button
                                                onClick={() => handleDeleteProject(project._id)}
                                                className="shrink-0 font-mono text-xs uppercase tracking-widest text-[#9A9A94] hover:text-[#141414]"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        {project.description && (
                                            <p className="mt-1 text-sm text-[#6B6B6B]">{project.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};