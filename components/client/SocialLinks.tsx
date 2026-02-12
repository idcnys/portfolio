"use client";

export default function SocialLinks() {
  const openSocial = (platform: string) => {
    const urls: Record<string, string> = {
      LinkedIn: "https://www.linkedin.com/in/bittosaha",
      GitHub: "https://github.com/idcnys",
      Twitter: "https://twitter.com/bittosaha21",
      Facebook: "https://www.facebook.com/biiitto",
      Email: "mailto:bittosaaha@gmail.com",
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "noopener,noreferrer");
    }
  };

  return (
    <ul className="flex gap-4 mb-2">
      <li
        onClick={() => openSocial("LinkedIn")}
        className="cursor-pointer hover:scale-110 transition-transform"
      >
        <img
          src="/icons/icons8-linkedin-50.svg"
          alt="LinkedIn"
          className="w-6 h-6"
        />
      </li>
      <li
        onClick={() => openSocial("GitHub")}
        className="cursor-pointer hover:scale-110 transition-transform"
      >
        <img
          src="/icons/icons8-github-50.svg"
          alt="GitHub"
          className="w-6 h-6"
        />
      </li>
      <li
        onClick={() => openSocial("Twitter")}
        className="cursor-pointer hover:scale-110 transition-transform"
      >
        <img
          src="/icons/icons8-twitter-bird.svg"
          alt="Twitter"
          className="w-6 h-6"
        />
      </li>
      <li
        onClick={() => openSocial("Facebook")}
        className="cursor-pointer hover:scale-110 transition-transform"
      >
        <img
          src="/icons/icons8-facebook-50.svg"
          alt="Facebook"
          className="w-6 h-6"
        />
      </li>
      <li
        onClick={() => openSocial("Email")}
        className="cursor-pointer hover:scale-110 transition-transform"
      >
        <img src="/icons/icons8-gmail-50.svg" alt="Email" className="w-6 h-6" />
      </li>
    </ul>
  );
}
