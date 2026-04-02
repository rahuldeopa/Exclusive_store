export async function getBookContentService(passcode: string) {
  // In a real app, you might fetch this from the database or an S3 bucket 
  // tied to the passcode. Since constraints ask for JSON format and minimal changes,
  // we return a static mock that simulates the Digital Book experience.

  return {
    title: "The Silent Symphony",
    author: "Elena Vance",
    pages: [
      {
        page: 1,
        content: "<p>The rain slashed against the windowpane, a violent contrast to the stillness inside the room. Dr. Aris Thorne stared at the glowing sequence on his monitor. It wasn't just data; it was a rhythmic anomaly. Almost like... music.</p><p>For years, his team at the Deep Space Observatory had cataloged the ambient noise of the cosmos—pulsars, quasars, the hum of background radiation. But this was different. This had structure. A cadence that shouldn't exist in the chaotic void.</p>"
      },
      {
        page: 2,
        content: "<p>He adjusted the frequency bands. The static hissed, then suddenly dropped away, leaving a clear, haunting melody composed of low-frequency pulses.</p><p>'It's a mathematical progression,' muttered Sarah, his lead analyst, appearing silently at his shoulder. 'Look at the intervals. It's skipping prime numbers.'</p><p>Aris didn't answer. He was too busy listening. The sound resonated in his bones, making him feel both incredibly small and intimately connected to whatever was out there.</p>"
      },
      {
        page: 3,
        content: "<p>The next day, the signal changed. It wasn't just pulses anymore. It was a complex symphony of frequencies. The implications were staggering.</p><p>'We need to isolate the origin,' Aris ordered, his voice tight with anticipation. The screens flickered as the system struggled to process the immense bandwidth of the incoming data.</p>"
      },
      {
        page: 4,
        content: "<p>As the origin coordinates crystallized on the screen, a collective gasp swept through the control room. The signal wasn't coming from a distant galaxy. It was coming from the edge of our own solar system... from the Oort Cloud.</p><p>And it was moving closer.</p>"
      },
      {
        page: 5,
        content: "<p>In the weeks that followed, the world changed. The discovery was leaked, and panic inevitably intertwined with wonder. Aris found himself thrust into the spotlight, the reluctant ambassador for an humanity facing its first undeniable proof of extraterrestrial intelligence.</p><p>But the true marvel wasn't the panic; it was the music. The 'Silent Symphony,' as it was dubbed, began to affect people. Those who listened to it reported vivid dreams, unexplained serenity, and a sudden, profound understanding of complex mathematical concepts.</p>"
      },
      {
        page: 6,
        content: "<p>The closer the source got, the louder and clearer the symphony became. It was no longer just a signal picked up by massive radio telescopes; it was bleeding into commercial radio frequencies, television broadcasts, even unshielded communication networks.</p><p>The world united in a strange, unprecedented silence, raptly listening to the celestial performance.</p>"
      },
      {
        page: 7,
        content: "<p>Then, the music stopped.</p><p>The silence that followed was deafening. It stretched for hours, then days. The sudden absence of the symphony left humanity with a profound sense of loss, a chilling emptiness that no earthly sound could fill.</p><p>Aris stared at the blank screens, the silence heavy and oppressive in the observatory. Was that it? A passing concert? Or a prelude to something else?</p>"
      },
      {
        page: 8,
        content: "<p>The answer arrived not in sound, but in light. A massive, geometric structure, older than planets, materialized in orbit around Mars. It was the orchestra, finally taking the stage.</p><p>And humanity held its breath, waiting for the conductor's baton to fall.</p><p><i>The End.</i></p>"
      }
    ]
  };
}

export async function getBookVideosService(passcode: string) {
  // Return video mapping for specific pages
  return [
    { page: 3, title: "The Signal Discovery", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { page: 8, title: "Arrival at Mars", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
  ];
}

export async function getBookAudioService(passcode: string) {
  // Return audio tracks for the end of the book
  return [
    { id: 1, title: "The Silent Symphony - Part 1", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: 2, title: "Cosmic Resonance", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" }
  ];
}
