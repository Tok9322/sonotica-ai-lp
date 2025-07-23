// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Audio Player Management ---
    const allAudioPlayers = document.querySelectorAll('audio');
    const pauseAllPlayers = (exception) => {
        allAudioPlayers.forEach(player => {
            if (player !== exception) player.pause();
        });
    };
    allAudioPlayers.forEach(player => {
        player.addEventListener('play', () => pauseAllPlayers(player));
    });

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Playlist Functionality ---
    document.querySelectorAll('.album-card').forEach(albumCard => {
        const audioPlayer = albumCard.querySelector('.album-player');
        const playlistItems = albumCard.querySelectorAll('.playlist li');

        if (!audioPlayer || playlistItems.length === 0) return;

        // Function to get the full, decoded URL for comparison. This is the key to the fix.
        const getDecodedURL = (path) => {
            const a = document.createElement('a');
            a.href = path;
            // Browsers resolve the full path (e.g., http://localhost:8000/audio/...). We decode it to handle special chars.
            return decodeURIComponent(a.href);
        };

        // Load the first song by default, but don't play
        audioPlayer.src = playlistItems[0].dataset.src;

        const playSong = (index) => {
            if (index >= playlistItems.length) return;

            const songItem = playlistItems[index];
            const targetSrc = getDecodedURL(songItem.dataset.src);
            const currentSrc = getDecodedURL(audioPlayer.src);

            // If the clicked song is the current one and it's playing, pause it.
            if (targetSrc === currentSrc && !audioPlayer.paused) {
                audioPlayer.pause();
            } else {
                // Otherwise, set the new source and play.
                audioPlayer.src = songItem.dataset.src;
                audioPlayer.play();
            }
        };

        playlistItems.forEach((item, index) => {
            item.addEventListener('click', () => playSong(index));
        });

        // This function updates the 'playing' class for visual feedback.
        const updatePlayingClass = () => {
            const currentSrc = getDecodedURL(audioPlayer.src);
            playlistItems.forEach(item => {
                const itemSrc = getDecodedURL(item.dataset.src);
                if (itemSrc === currentSrc && !audioPlayer.paused) {
                    item.classList.add('playing');
                } else {
                    item.classList.remove('playing');
                }
            });
        };

        // Update the 'playing' class on play and pause events.
        audioPlayer.addEventListener('play', updatePlayingClass);
        audioPlayer.addEventListener('pause', updatePlayingClass);

        // Auto-play the next song when one ends.
        audioPlayer.addEventListener('ended', () => {
            const currentSrc = getDecodedURL(audioPlayer.src);
            let currentIndex = -1;
            // Find the index of the song that just ended.
            for (let i = 0; i < playlistItems.length; i++) {
                if (getDecodedURL(playlistItems[i].dataset.src) === currentSrc) {
                    currentIndex = i;
                    break;
                }
            }

            // If it's not the last song, play the next one.
            if (currentIndex !== -1 && currentIndex < playlistItems.length - 1) {
                playSong(currentIndex + 1);
            }
        });
    });
});
