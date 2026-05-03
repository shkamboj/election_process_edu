/**
 * Fallback YouTube video data used when the YouTube Data API is unavailable.
 * Organised by country ID; falls back to `default` if no country-specific entry exists.
 */
const FALLBACK_VIDEOS = {
  default: [
    {
      video_id: 'R4lW3Y5zk9Y',
      title: 'How Elections Work',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/R4lW3Y5zk9Y/mqdefault.jpg',
    },
    {
      video_id: '4SWSv50VIe4',
      title: 'The Election Process Explained',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/4SWSv50VIe4/mqdefault.jpg',
    },
  ],
  usa: [
    {
      video_id: 'Jdadb7qMBcE',
      title: 'How US Elections Work',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/Jdadb7qMBcE/mqdefault.jpg',
    },
    {
      video_id: '_kQTjHTkR3s',
      title: 'The US Election Process Explained',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/_kQTjHTkR3s/mqdefault.jpg',
    },
  ],
  indonesia: [
    {
      video_id: 'Pogv_MAWXHY',
      title: 'Indonesia Election Process',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/Pogv_MAWXHY/mqdefault.jpg',
    },
    {
      video_id: '9u2ggy9GyrY',
      title: 'Pemilu Indonesia Explained',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/9u2ggy9GyrY/mqdefault.jpg',
    },
  ],
  brazil: [
    {
      video_id: 'k7cWY3FA1Uc',
      title: 'Brazil Election Process',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/k7cWY3FA1Uc/mqdefault.jpg',
    },
    {
      video_id: 'JvvUtjpYnjQ',
      title: 'Eleições no Brasil Explicadas',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/JvvUtjpYnjQ/mqdefault.jpg',
    },
  ],
  pakistan: [
    {
      video_id: 'DOhIKbyhMug',
      title: 'Pakistan Election Process',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/DOhIKbyhMug/mqdefault.jpg',
    },
    {
      video_id: 'ICMW5LKS3O4',
      title: 'How Elections Work in Pakistan',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/ICMW5LKS3O4/mqdefault.jpg',
    },
  ],
  nigeria: [
    {
      video_id: 'zLoXyka7Tvs',
      title: 'Nigeria Election Process',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/zLoXyka7Tvs/mqdefault.jpg',
    },
    {
      video_id: 'FjiogmLKuAs',
      title: 'How Elections Work in Nigeria',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/FjiogmLKuAs/mqdefault.jpg',
    },
  ],
  bangladesh: [
    {
      video_id: 'IS8CUXtylnI',
      title: 'Bangladesh Election Process',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/IS8CUXtylnI/mqdefault.jpg',
    },
    {
      video_id: 'oPen2zOImI0',
      title: 'How Elections Work in Bangladesh',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/oPen2zOImI0/mqdefault.jpg',
    },
  ],
  japan: [
    {
      video_id: '6w4SKs_4H0Q',
      title: 'Japan Election Process',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/6w4SKs_4H0Q/mqdefault.jpg',
    },
    {
      video_id: 'wHRmbAyW5lM',
      title: 'How Elections Work in Japan',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/wHRmbAyW5lM/mqdefault.jpg',
    },
  ],
  mexico: [
    {
      video_id: 'Sb9AxG03kgU',
      title: 'Mexico Election Process',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/Sb9AxG03kgU/mqdefault.jpg',
    },
    {
      video_id: 'kA_A7FATobw',
      title: 'Cómo Funcionan las Elecciones en México',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/kA_A7FATobw/mqdefault.jpg',
    },
  ],
  philippines: [
    {
      video_id: 'oydSHY2_RWk',
      title: 'Philippines Election Process',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/oydSHY2_RWk/mqdefault.jpg',
    },
    {
      video_id: '4iulAcpjo5Q',
      title: 'How Elections Work in the Philippines',
      channel: 'YouTube',
      thumbnail: 'https://i.ytimg.com/vi/4iulAcpjo5Q/mqdefault.jpg',
    },
  ],
};

export default FALLBACK_VIDEOS;
