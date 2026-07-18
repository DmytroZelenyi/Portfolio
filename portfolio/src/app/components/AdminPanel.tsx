'use client';

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface Skill {
    _id: string;
    title: string;
    startedLearning: string;
    icon: string;
}


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/skills";

export const AdminPanel = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [name, setName] = useState("");
    const [startedLearning, setStartedLearning] = useState("");
    const [icon, setIcon] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSkills = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get<Skill[]>(API_URL);
            setSkills(response.data);
        } catch (err) {
            console.error(err);
            setError("Can't fetch skills");
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
            setError("Can't add skill");
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
            setError("Can't delete skill");
            fetchSkills(); 
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] text-[#141414] px-6 py-16 font-[Georgia,serif]">
            <div className="mx-auto max-w-2xl">
                <header className="mb-12 border-b border-[#141414] pb-6">
                    <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">
                        Портфоліо
                    </p>
                    <h1 className="text-4xl font-normal tracking-tight">Admin Panel</h1>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto_auto]"
                >
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Назва скілу"
                        required
                        className="border-b border-[#141414] bg-transparent px-1 py-2 font-[Georgia,serif] text-base placeholder:text-[#9A9A94] focus:outline-none focus:border-b-2"
                    />
                    <input
                        type="date"
                        value={startedLearning}
                        onChange={(e) => setStartedLearning(e.target.value)}
                        required
                        className="border-b border-[#141414] bg-transparent px-1 py-2 font-mono text-sm text-[#141414] focus:outline-none focus:border-b-2"
                    />
                    <input
                        type="text"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="Іконка"
                        className="border-b border-[#141414] bg-transparent px-1 py-2 font-[Georgia,serif] text-base placeholder:text-[#9A9A94] focus:outline-none focus:border-b-2 sm:w-24"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="border border-[#141414] bg-[#141414] px-5 py-2 font-mono text-xs uppercase tracking-widest text-[#FAFAF8] transition-colors hover:bg-[#FAFAF8] hover:text-[#141414] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isSubmitting ? "..." : "Додати"}
                    </button>
                </form>

                {error && (
                    <p className="mb-6 border border-[#141414] px-4 py-2 font-mono text-xs text-[#141414]">
                        {error}
                    </p>
                )}

                <section>
                    <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">
                        Список доданих скілів {!isLoading && `(${skills.length})`}
                    </p>

                    {isLoading ? (
                        <p className="font-mono text-sm text-[#6B6B6B]">Завантаження...</p>
                    ) : skills.length === 0 ? (
                        <p className="font-mono text-sm text-[#6B6B6B]">Скілів ще немає.</p>
                    ) : (
                        <ul className="divide-y divide-[#E4E4E1] border-t border-[#141414]">
                            {skills.map((skill, index) => (
                                <li
                                    key={skill._id}
                                    className="group flex items-center justify-between gap-4 py-4"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        <span className="shrink-0 font-mono text-xs text-[#9A9A94]">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
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
                                                з {skill.startedLearning}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(skill._id)}
                                        className="border border-transparent px-3 py-1 font-mono text-xs uppercase tracking-widest text-[#9A9A94] opacity-0 transition-all hover:border-[#141414] hover:text-[#141414] group-hover:opacity-100"
                                    >
                                        Видалити
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
};