async function testCobalt() {
  try {
    const res = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.youtube.com/watch?v=-ImqIW1tJ1A',
        isAudioOnly: false,
        vQuality: '1080',
      })
    });
    const data = await res.json();
    console.log('Video response:', data);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testCobalt().catch(console.error);
