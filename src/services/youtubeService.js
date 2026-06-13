// YouTube API Integration Service

// Popular, working fallback videos in case the user doesn't have an API key or API limits are reached
const FALLBACK_RECIPE_VIDEOS = [
  {
    videoId: "wT7v2q0vG1c",
    title: "Gordon Ramsay's Ultimate Cookery Course",
    channelTitle: "Gordon Ramsay"
  },
  {
    videoId: "y1fU3nLpndc",
    title: "15 Easy Recipes For Beginners",
    channelTitle: "Tasty"
  },
  {
    videoId: "vP7_W5j70_E",
    title: "How to Cook Rice - Perfect Basmati Rice",
    channelTitle: "Jamie Oliver"
  },
  {
    videoId: "MvM1mI75b0Q",
    title: "Mastering Basic Knife Skills",
    channelTitle: "Epicurious"
  },
  {
    videoId: "slFAnDIfiP4",
    title: "Quick and Easy Dinner Recipes",
    channelTitle: "Natashas Kitchen"
  }
];

const FALLBACK_DIY_VIDEOS = [
  {
    videoId: "d3vOqgVw84w",
    title: "20 Creative Ways to Upcycle Trash into Treasure",
    channelTitle: "5-Minute Crafts"
  },
  {
    videoId: "sW85PZkHspI",
    title: "10 Easy Cardboard Craft Ideas",
    channelTitle: "Crafty Hacks"
  },
  {
    videoId: "0n3Psz6oX7M",
    title: "DIY Room Decor Organization and Upcycling",
    channelTitle: "HGTV Handmade"
  },
  {
    videoId: "vX9r-K1f5e8",
    title: "How to Build a Planter Box from Pallets",
    channelTitle: "Woodworking for Mere Mortals"
  },
  {
    videoId: "e9yQ4Yq-k4c",
    title: "15 Incredible Plastic Bottle Life Hacks",
    channelTitle: "Blossom"
  }
];

export const youtubeService = {
  /**
   * Search YouTube for a query and return 1-2 video items.
   * Falls back to high-quality preset videos if key is missing or calls fail.
   */
  async searchVideos(query, category = 'recipe') {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

    if (!apiKey || apiKey === 'YOUR_YOUTUBE_DATA_API_KEY_HERE' || apiKey.trim() === '') {
      console.warn("YouTube API Key not found or set as placeholder. Returning mock video fallbacks.");
      return this.getMockVideos(category);
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`YouTube API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        return data.items.map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
        }));
      }
      
      return this.getMockVideos(category);
    } catch (error) {
      console.error("YouTube search API failed, using fallbacks:", error);
      return this.getMockVideos(category);
    }
  },

  /**
   * Helper to return static high-quality video embeds.
   */
  getMockVideos(category) {
    const list = category === 'recipe' ? FALLBACK_RECIPE_VIDEOS : FALLBACK_DIY_VIDEOS;
    // Map list to the unified schema
    return list.map(v => ({
      ...v,
      thumbnail: `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`
    }));
  }
};
