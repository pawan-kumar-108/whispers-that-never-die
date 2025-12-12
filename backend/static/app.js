const socket = io();

const colorInput = document.getElementById('color-picker');
const userMsgInput = document.getElementById('user-message');
const sewButton = document.getElementById('submit-button');
const quiltContainer = document.getElementById('quilt-container');

function addPatch(patch) {
  const div = document.createElement('div');
  div.className = 'patch';
  div.style.backgroundColor = patch.color || '#ccc';

  // Handle title tooltip
  const msg = patch.message || patch.ai_line || 'Untitled patch';
  const time = patch.timestamp || '';
  div.title = `${msg}\n${time}`.trim();

  document.getElementById('quilt-container').appendChild(div);

  // Update counter
  const counter = document.getElementById('patch-counter');
  if (counter) {
    counter.textContent = `🧵 ${document.querySelectorAll('.patch').length} patches sewn`;
  }
}

// Load all patches from DB on page load
fetch('/get-patches')
  .then(res => res.json())
  .then(data => {
    console.log("Fetched patches from DB:", data);
    data.forEach(patch => addPatch(patch));
  })
  .catch(err => console.error("Error fetching patches:", err));


// emotion suggestion buttons
document.querySelectorAll('.emotion-tag').forEach(button => {
  button.addEventListener('click', () => {
    userMsgInput.value = button.textContent;
  });
});

sewButton.onclick = async () => {
  const messageText = userMsgInput.value.trim();

  if (messageText.length === 0) {
    alert("Please enter something to sew 🌸");
    return;
  }

  if (messageText.length > 200) {
    alert("That message is a bit too long to stitch — try shortening it");
    return;
  }

  const patch = {
    color: colorInput.value,
    message: messageText,
    ai_line: "",
    timestamp: new Date().toISOString()
  };

  socket.emit('new_patch', patch);
  userMsgInput.value = '';

  // AI affirmation
  try {
    const response = await fetch('/ai-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: messageText })
    });

    const data = await response.json();
    const affirmationText = `"${data.line.trim()}"`;

    const affirmationDiv = document.getElementById('affirmation');
    affirmationDiv.textContent = "";
    affirmationDiv.classList.add('show');

    let i = 0;
    function typeWriter() {
      if (i < affirmationText.length) {
        affirmationDiv.textContent += affirmationText.charAt(i);
        i++;
        setTimeout(typeWriter, 30);
      }
    }
    typeWriter();

  } catch (error) {
    console.error("Failed to fetch affirmation:", error);
  }
};

socket.on('update_quilt', (patch) => {
  addPatch(patch);
});

window.onload = () => {
  const affirmationDiv = document.getElementById('affirmation');
  affirmationDiv.textContent = "Welcome to Patchwork 🌸 — a cozy corner where your feelings become colors and poetry. Pick how you feel, and let the quilt grow with you.";
  affirmationDiv.classList.add('show');
};

const music = document.getElementById('bg-music');
const toggleBtn = document.getElementById('music-toggle');
let isPlaying = false;

toggleBtn.onclick = () => {
  if (!isPlaying) {
    music.play();
    toggleBtn.textContent = '🔊';
  } else {
    music.pause();
    toggleBtn.textContent = '🔇';
  }
  isPlaying = !isPlaying;
};
document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  let isPlaying = false;

  musicBtn.addEventListener('click', () => {
    if (!isPlaying) {
      audio.volume = 0.4;
      audio.play().then(() => {
        isPlaying = true;
        musicBtn.textContent = "🔊";
      }).catch(err => {
        console.error("Playback failed:", err);
        alert("Browser blocked autoplay. Try clicking again.");
      });
    } else {
      audio.pause();
      isPlaying = false;
      musicBtn.textContent = "🔇";
    }
  });
});

