import { Conversation } from '@/types/conversation'

export const conversationsMock: Conversation[] = [
  {
    id: 'c1',
    artist: { id: 'artist1', name: 'The Midnight Duo' },
    venue: { id: 'venue1', name: 'Ocean Breeze Lounge' },
    messages: [
      {
        id: 'm1',
        senderId: 'artist1',
        content: 'Hi, is Friday available?',
        timestamp: new Date('2026-05-18T10:00:00'),
      },
      {
        id: 'm2',
        senderId: 'venue1',
        content: 'Yes, Friday evening is open.',
        timestamp: new Date('2026-05-18T10:10:00'),
      },
      {
        id: 'm3',
        senderId: 'artist1',
        content: 'Great, here is our tech rider.',
        timestamp: new Date('2026-05-18T10:15:00'),
        attachments: [
          {
            id: 'a1',
            type: 'pdf',
            name: 'Tech-Rider.pdf',
            url: '/mock/tech-rider.pdf',
            size: '2.4 MB',
          },
        ],
      },
    ],
  },

  {
    id: 'c2',
    artist: { id: 'artist2', name: 'Neon Pulse' },
    venue: { id: 'venue2', name: 'Skyline Rooftop' },
    messages: [
      {
        id: 'm1',
        senderId: 'artist2',
        content: 'Promo images attached.',
        timestamp: new Date('2026-05-17T18:00:00'),
        attachments: [
          {
            id: 'a2',
            type: 'image',
            name: 'promo1.jpg',
            url: 'https://images.unsplash.com/photo-1504600770771-fb03a6961d33',
          },
          {
            id: 'a3',
            type: 'image',
            name: 'promo2.jpg',
            url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
          },
        ],
      },
      {
        id: 'm2',
        senderId: 'venue2',
        content: 'Looks good!',
        timestamp: new Date('2026-05-17T18:10:00'),
      },
    ],
  },
  {
    id: 'c3',
    artist: { id: 'artist3', name: 'Velvet Echo' },
    venue: { id: 'venue3', name: 'Aurora Hall' },

    messages: [
      {
        id: 'm1',
        senderId: 'artist3',
        content: 'Hi, we’re interested in a Saturday booking.',
        timestamp: new Date('2026-05-10T09:00:00'),
      },
      {
        id: 'm2',
        senderId: 'venue3',
        content: 'Saturday is open from 7PM onwards.',
        timestamp: new Date('2026-05-10T09:05:00'),
      },
      {
        id: 'm3',
        senderId: 'artist3',
        content: 'Great. Here’s our promo material.',
        timestamp: new Date('2026-05-10T09:10:00'),
        attachments: [
          {
            id: 'a1',
            type: 'image',
            name: 'promo.jpg',
            url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
          },
        ],
      },
      {
        id: 'm4',
        senderId: 'venue3',
        content: 'Do you have a live performance video?',
        timestamp: new Date('2026-05-10T09:12:00'),
      },
      {
        id: 'm5',
        senderId: 'artist3',
        content: 'Yes, here is a YouTube link.',
        timestamp: new Date('2026-05-10T09:14:00'),
        attachments: [
          {
            id: 'a2',
            type: 'video',
            name: 'live-set.mp4',
            url: 'https://www.youtube.com/watch?v=ApXoWvfEYVU',
          },
        ],
      },
      {
        id: 'm6',
        senderId: 'venue3',
        content: 'Can you send your tech requirements?',
        timestamp: new Date('2026-05-10T09:18:00'),
      },
      {
        id: 'm7',
        senderId: 'artist3',
        content: 'Attached technical rider.',
        timestamp: new Date('2026-05-10T09:20:00'),
        attachments: [
          {
            id: 'a3',
            type: 'pdf',
            name: 'tech-rider.pdf',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
        ],
      },
      {
        id: 'm8',
        senderId: 'venue3',
        content: 'We will review it with our sound team.',
        timestamp: new Date('2026-05-10T09:25:00'),
      },
      {
        id: 'm9',
        senderId: 'artist3',
        content: 'Also sending our stage setup doc.',
        timestamp: new Date('2026-05-10T09:28:00'),
        attachments: [
          {
            id: 'a4',
            type: 'document',
            name: 'stage-plan.docx',
            url: 'https://file-examples.com/storage/feec7a8b7f1b7a1b/docx_example.docx',
          },
        ],
      },
      {
        id: 'm10',
        senderId: 'venue3',
        content: 'Looks good. Let’s proceed to contract.',
        timestamp: new Date('2026-05-10T09:35:00'),
      },
    ],
  },
  {
    id: 'c4',
    artist: { id: 'artist4', name: 'Neon Pulse' },
    venue: { id: 'venue4', name: 'Skyline Rooftop' },

    messages: [
      {
        id: 'm1',
        senderId: 'artist4',
        content: 'Hey! Sending our latest set samples.',
        timestamp: new Date('2026-05-12T18:00:00'),
      },
      {
        id: 'm2',
        senderId: 'artist4',
        content: 'Audio preview attached.',
        timestamp: new Date('2026-05-12T18:02:00'),
        attachments: [
          {
            id: 'a1',
            type: 'audio',
            name: 'set-preview.mp3',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          },
        ],
      },
      {
        id: 'm3',
        senderId: 'venue4',
        content: 'Nice sound. What’s your stage setup?',
        timestamp: new Date('2026-05-12T18:05:00'),
      },
      {
        id: 'm4',
        senderId: 'artist4',
        content: 'Full DJ + controller setup.',
        timestamp: new Date('2026-05-12T18:06:00'),
      },
      {
        id: 'm5',
        senderId: 'artist4',
        content: 'Here’s a stage photo.',
        timestamp: new Date('2026-05-12T18:07:00'),
        attachments: [
          {
            id: 'a2',
            type: 'image',
            name: 'stage.jpg',
            url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063',
          },
        ],
      },
      {
        id: 'm6',
        senderId: 'venue4',
        content: 'Do you have a rider document?',
        timestamp: new Date('2026-05-12T18:10:00'),
      },
      {
        id: 'm7',
        senderId: 'artist4',
        content: 'Yes, here it is.',
        timestamp: new Date('2026-05-12T18:11:00'),
        attachments: [
          {
            id: 'a3',
            type: 'pdf',
            name: 'dj-rider.pdf',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
        ],
      },
      {
        id: 'm8',
        senderId: 'venue4',
        content: 'We’ll need lighting specs too.',
        timestamp: new Date('2026-05-12T18:12:00'),
      },
      {
        id: 'm9',
        senderId: 'artist4',
        content: 'Sending full documentation.',
        timestamp: new Date('2026-05-12T18:13:00'),
        attachments: [
          {
            id: 'a4',
            type: 'document',
            name: 'lighting-plan.docx',
            url: 'https://file-examples.com/storage/feec7a8b7f1b7a1b/docx_example.docx',
          },
        ],
      },
      {
        id: 'm10',
        senderId: 'venue4',
        content: 'Approved pending final contract.',
        timestamp: new Date('2026-05-12T18:20:00'),
      },
    ],
  },
]
