"use client";

import { useState, useEffect, useCallback } from "react";
import { PortfolioSettings } from "../../../../lib/types";
import { updatePortfolioSettings } from "../../../../lib/firebase";

type SetMessage = (msg: { text: string; type: string }) => void;

export function useCodespaceManager(
  setMessage: SetMessage,
  portfolioSettings: PortfolioSettings | null
) {
  const [githubTokenInput, setGithubTokenInput] = useState("");
  const [codespaceCode, setCodespaceCode] = useState("// Start coding...\n");
  const [githubUser, setGithubUser] = useState<{ login: string } | null>(null);
  const [repoList, setRepoList] = useState<
    Array<{ id: number; name: string; full_name: string; private: boolean }>
  >([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [repoEntries, setRepoEntries] = useState<
    Array<{ name: string; path: string; type: "file" | "dir" }>
  >([]);
  const [repoPath, setRepoPath] = useState("");
  const [repoNameInput, setRepoNameInput] = useState("");
  const [repoVisibility, setRepoVisibility] = useState<"public" | "private">(
    "public"
  );
  const [filePathInput, setFilePathInput] = useState("README.md");
  const [commitMessage, setCommitMessage] = useState("Update via Codespace");
  const [codespaceBusy, setCodespaceBusy] = useState(false);

  const getGithubToken = useCallback(
    () => portfolioSettings?.githubToken?.trim() || githubTokenInput.trim(),
    [portfolioSettings?.githubToken, githubTokenInput]
  );

  const encodeBase64 = (value: string) =>
    typeof window === "undefined"
      ? ""
      : btoa(unescape(encodeURIComponent(value)));

  const decodeBase64 = (value: string) =>
    typeof window === "undefined"
      ? ""
      : decodeURIComponent(escape(atob(value)));

  const safeRepoPath = (path: string) =>
    path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

  const fetchGithubUser = async (token: string) => {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub user");
    }

    const data = (await response.json()) as { login: string };
    setGithubUser({ login: data.login });
    return data.login;
  };

  // Auto-authenticate when token changes
  useEffect(() => {
    const savedToken = portfolioSettings?.githubToken?.trim();
    if (!savedToken) {
      setGithubUser(null);
      return;
    }
    fetchGithubUser(savedToken).catch(() => {
      setGithubUser(null);
    });
  }, [portfolioSettings?.githubToken]);

  // Load repo entries when selectedRepo changes
  useEffect(() => {
    if (!selectedRepo) {
      setRepoEntries([]);
      setRepoPath("");
      return;
    }
    loadRepoEntries("").catch(() => {
      setRepoEntries([]);
    });
  }, [selectedRepo]);

  const handleSaveGithubToken = async () => {
    const token = githubTokenInput.trim();
    if (!token) {
      setMessage({ text: "Enter a GitHub token first.", type: "error" });
      return;
    }
    await updatePortfolioSettings({ githubToken: token });
    setGithubTokenInput("");
    setMessage({ text: "GitHub token saved.", type: "success" });
  };

  const handleClearGithubToken = async () => {
    await updatePortfolioSettings({ githubToken: "" });
    setGithubUser(null);
    setRepoList([]);
    setSelectedRepo("");
    setMessage({ text: "GitHub token cleared.", type: "success" });
  };

  const loadRepoEntries = async (path: string) => {
    const token = getGithubToken();
    if (!token || !selectedRepo) return;

    const normalizedPath = path.trim();
    setCodespaceBusy(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${selectedRepo}/contents/${safeRepoPath(normalizedPath)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load repo contents");
      }

      const data = (await response.json()) as Array<{
        name: string;
        path: string;
        type: "file" | "dir";
      }>;

      setRepoEntries(data);
      setRepoPath(normalizedPath);
    } catch (error) {
      setMessage({ text: "Failed to load repo files.", type: "error" });
    } finally {
      setCodespaceBusy(false);
    }
  };

  const loadFileByPath = async (path: string, notify = true) => {
    const token = getGithubToken();
    if (!token || !selectedRepo) {
      setMessage({ text: "Select a repo and token first.", type: "error" });
      return;
    }

    const normalizedPath = path.trim();
    if (!normalizedPath) {
      setMessage({ text: "Enter a file path.", type: "error" });
      return;
    }

    setCodespaceBusy(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${selectedRepo}/contents/${safeRepoPath(normalizedPath)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load file");
      }

      const data = (await response.json()) as { content?: string };
      if (data.content) {
        setCodespaceCode(decodeBase64(data.content));
        setFilePathInput(normalizedPath);
        if (notify) {
          setMessage({ text: "File loaded.", type: "success" });
        }
      }
    } catch (error) {
      setMessage({ text: "Failed to load file.", type: "error" });
    } finally {
      setCodespaceBusy(false);
    }
  };

  const handleLoadRepos = async () => {
    const token = getGithubToken();
    if (!token) {
      setMessage({ text: "Add a GitHub token to load repos.", type: "error" });
      return;
    }

    setCodespaceBusy(true);
    try {
      const response = await fetch(
        "https://api.github.com/user/repos?per_page=100&sort=updated",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load repos");
      }

      const data = (await response.json()) as Array<{
        id: number;
        name: string;
        full_name: string;
        private: boolean;
      }>;
      setRepoList(data);
      if (!selectedRepo && data.length > 0) {
        setSelectedRepo(data[0].full_name);
      }
      setMessage({ text: "Repos loaded.", type: "success" });
    } catch (error) {
      setMessage({ text: "Failed to load repos.", type: "error" });
    } finally {
      setCodespaceBusy(false);
    }
  };

  const handleCreateRepo = async () => {
    const token = getGithubToken();
    if (!token) {
      setMessage({ text: "Add a GitHub token first.", type: "error" });
      return;
    }

    const name = repoNameInput.trim();
    if (!name) {
      setMessage({ text: "Enter a repository name.", type: "error" });
      return;
    }

    setCodespaceBusy(true);
    try {
      const response = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          private: repoVisibility === "private",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create repo");
      }

      const data = (await response.json()) as { full_name: string };
      setRepoNameInput("");
      setSelectedRepo(data.full_name);
      await handleLoadRepos();
      setMessage({ text: "Repository created.", type: "success" });
    } catch (error) {
      setMessage({ text: "Failed to create repo.", type: "error" });
    } finally {
      setCodespaceBusy(false);
    }
  };

  const handleLoadFile = async () => {
    await loadFileByPath(filePathInput.trim());
  };

  const handleSaveFile = async () => {
    const token = getGithubToken();
    if (!token || !selectedRepo) {
      setMessage({ text: "Select a repo and token first.", type: "error" });
      return;
    }

    const path = filePathInput.trim();
    if (!path) {
      setMessage({ text: "Enter a file path.", type: "error" });
      return;
    }

    setCodespaceBusy(true);
    try {
      let sha: string | undefined;
      const existingResponse = await fetch(
        `https://api.github.com/repos/${selectedRepo}/contents/${safeRepoPath(path)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      if (existingResponse.ok) {
        const existingData = (await existingResponse.json()) as {
          sha?: string;
        };
        sha = existingData.sha;
      }

      const response = await fetch(
        `https://api.github.com/repos/${selectedRepo}/contents/${safeRepoPath(path)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: commitMessage.trim() || "Update via Codespace",
            content: encodeBase64(codespaceCode),
            ...(sha ? { sha } : {}),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save file");
      }

      setMessage({ text: "File saved to GitHub.", type: "success" });
    } catch (error) {
      setMessage({ text: "Failed to save file.", type: "error" });
    } finally {
      setCodespaceBusy(false);
    }
  };

  return {
    githubTokenInput,
    setGithubTokenInput,
    codespaceCode,
    setCodespaceCode,
    githubUser,
    repoList,
    selectedRepo,
    setSelectedRepo,
    repoEntries,
    repoPath,
    repoNameInput,
    setRepoNameInput,
    repoVisibility,
    setRepoVisibility,
    filePathInput,
    setFilePathInput,
    commitMessage,
    setCommitMessage,
    codespaceBusy,
    handleSaveGithubToken,
    handleClearGithubToken,
    handleLoadRepos,
    handleCreateRepo,
    loadRepoEntries,
    loadFileByPath,
    handleLoadFile,
    handleSaveFile,
  };
}
