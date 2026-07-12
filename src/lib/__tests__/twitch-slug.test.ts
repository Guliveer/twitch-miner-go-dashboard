import { parseCategorySlug, isTwitchCategoryUrl, parseTeamSlug, isTwitchTeamUrl } from "../twitch-slug";

describe("parseCategorySlug", () => {
  describe("Twitch URL extraction", () => {
    it("extracts slug from standard Twitch category URL", () => {
      expect(parseCategorySlug("https://twitch.tv/directory/category/rust")).toBe("rust");
    });

    it("extracts slug from URL with www", () => {
      expect(parseCategorySlug("https://www.twitch.tv/directory/category/just-chatting")).toBe("just-chatting");
    });

    it("extracts slug from HTTP URL", () => {
      expect(parseCategorySlug("http://twitch.tv/directory/category/grand-theft-auto-v")).toBe("grand-theft-auto-v");
    });

    it("extracts slug from URL with trailing slash", () => {
      expect(parseCategorySlug("https://twitch.tv/directory/category/valorant/")).toBe("valorant");
    });

    it("extracts slug from URL with query params (ignores them)", () => {
      expect(parseCategorySlug("https://twitch.tv/directory/category/league-of-legends?ref=ml")).toBe("league-of-legends");
    });

    it("lowercases the extracted slug", () => {
      expect(parseCategorySlug("https://twitch.tv/directory/category/Counter-Strike")).toBe("counter-strike");
    });
  });

  describe("plain name to slug conversion", () => {
    it("converts single word to lowercase", () => {
      expect(parseCategorySlug("Rust")).toBe("rust");
    });

    it("converts multi-word name to kebab-case", () => {
      expect(parseCategorySlug("Just Chatting")).toBe("just-chatting");
    });

    it("converts name with special characters", () => {
      expect(parseCategorySlug("Grand Theft Auto V")).toBe("grand-theft-auto-v");
    });

    it("removes apostrophes", () => {
      expect(parseCategorySlug("PlayerUnknown's Battlegrounds")).toBe("playerunknowns-battlegrounds");
    });

    it("handles already-slugified input", () => {
      expect(parseCategorySlug("just-chatting")).toBe("just-chatting");
    });

    it("trims whitespace", () => {
      expect(parseCategorySlug("  rust  ")).toBe("rust");
    });

    it("collapses multiple special characters into single hyphen", () => {
      expect(parseCategorySlug("Tom Clancy's Rainbow Six Siege")).toBe("tom-clancys-rainbow-six-siege");
    });
  });

  describe("edge cases", () => {
    it("returns empty string for empty input", () => {
      expect(parseCategorySlug("")).toBe("");
    });

    it("returns empty string for whitespace-only input", () => {
      expect(parseCategorySlug("   ")).toBe("");
    });

    it("handles non-Twitch URLs as plain text", () => {
      expect(parseCategorySlug("https://example.com/rust")).toBe("https-example-com-rust");
    });
  });
});

describe("isTwitchCategoryUrl", () => {
  it("returns true for valid Twitch category URL", () => {
    expect(isTwitchCategoryUrl("https://twitch.tv/directory/category/rust")).toBe(true);
  });

  it("returns true for URL with www", () => {
    expect(isTwitchCategoryUrl("https://www.twitch.tv/directory/category/rust")).toBe(true);
  });

  it("returns true for URL with trailing slash", () => {
    expect(isTwitchCategoryUrl("https://twitch.tv/directory/category/rust/")).toBe(true);
  });

  it("returns false for non-Twitch URL", () => {
    expect(isTwitchCategoryUrl("https://example.com/rust")).toBe(false);
  });

  it("returns false for plain text", () => {
    expect(isTwitchCategoryUrl("rust")).toBe(false);
  });

  it("returns false for incomplete Twitch URL", () => {
    expect(isTwitchCategoryUrl("https://twitch.tv/directory")).toBe(false);
  });
});

describe("parseTeamSlug", () => {
  it("extracts slug from standard Twitch team URL", () => {
    expect(parseTeamSlug("https://twitch.tv/team/rainbow6")).toBe("rainbow6");
  });

  it("extracts slug from URL with www", () => {
    expect(parseTeamSlug("https://www.twitch.tv/team/otk")).toBe("otk");
  });

  it("extracts slug from URL with trailing slash", () => {
    expect(parseTeamSlug("https://twitch.tv/team/rainbow6/")).toBe("rainbow6");
  });

  it("lowercases the extracted slug", () => {
    expect(parseTeamSlug("https://twitch.tv/team/OTK")).toBe("otk");
  });

  it("extracts slug from URL with query params", () => {
    expect(parseTeamSlug("https://twitch.tv/team/rainbow6?ref=sidebar")).toBe("rainbow6");
  });

  it("converts plain text to slug", () => {
    expect(parseTeamSlug("Rainbow6")).toBe("rainbow6");
  });

  it("handles multi-word team names", () => {
    expect(parseTeamSlug("Team Solo Mid")).toBe("team-solo-mid");
  });

  it("trims whitespace", () => {
    expect(parseTeamSlug("  otk  ")).toBe("otk");
  });
});

describe("isTwitchTeamUrl", () => {
  it("returns true for valid Twitch team URL", () => {
    expect(isTwitchTeamUrl("https://twitch.tv/team/rainbow6")).toBe(true);
  });

  it("returns true for URL with www", () => {
    expect(isTwitchTeamUrl("https://www.twitch.tv/team/otk")).toBe(true);
  });

  it("returns false for category URL", () => {
    expect(isTwitchTeamUrl("https://twitch.tv/directory/category/rust")).toBe(false);
  });

  it("returns false for plain text", () => {
    expect(isTwitchTeamUrl("rainbow6")).toBe(false);
  });

  it("returns false for incomplete team URL", () => {
    expect(isTwitchTeamUrl("https://twitch.tv/team")).toBe(false);
  });
});
