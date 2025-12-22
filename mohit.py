import time
import sys
import random

def print_lyrics():
    """
    Prints lyrics with colored output and per-line custom typing speeds.
    You manually control speed for every line inside SPEED_MAP.
    """

    # ANSI colors
    COLORS = [
        "\033[91m", "\033[92m", "\033[93m",
        "\033[94m", "\033[95m", "\033[96m"
    ]
    RESET = "\033[0m"

    # Song Title
    song_title = "Neeve – Darling Movie"
    print("\033[95m" + song_title + RESET)
    print("\033[95m" + "-" * len(song_title) + RESET)
    time.sleep(1.0)

    # Lyrics (each line in order)
    lyrics = [
        "Oka nimisham lona santhosham",
        "Oka nimisham lona sandheham",
        "Nidhurana kuda hey nee dhyaanam",
        "Vadhaladhu nane hey nee rupam",
        "Nuvve.. Nuvve.. Hey hey hey..",
        "Nuvve.. Nuvve..",
        "Alochisthu pichodnayya nene ",
        "cheliyaaa"
    ]

    # -------------------------------------------------------
    # ✨ SPEED MAP → You manually edit these values
    # Format: "line text": (min_delay, max_delay)
    #
    # Smaller numbers = faster typing
    # Larger numbers  = slower typing
    # -------------------------------------------------------
    SPEED_MAP = {
        "Oka nimisham lona santhosham": (0.11, 0.19),   # FAST
        "Oka nimisham lona sandheham": (0.09, 0.18),      # Normal
        "Nidhurana kuda hey nee dhyaanam": (0.06, 0.18),
        "Vadhaladhu nane hey nee rupam": (0.05, 0.15),
        "Nuvve.. Nuvve.. Hey hey hey..": (0.12, 0.22),    # Slow
        "Nuvve.. Nuvve..": (0.20, 0.35),                  # VERY SLOW
        "Alochisthu pichodnayya nene ": (0.06, 0.18),
        "cheliyaaa": (0.22, 0.22),  
    }
    # -------------------------------------------------------

    def get_speed(line):
        # returns custom speed or fallback default
        return SPEED_MAP.get(line, (0.05, 0.20))

    time.sleep(1.5)

    for index, line in enumerate(lyrics):
        color = COLORS[index % len(COLORS)]
        print(color, end="")

        min_d, max_d = get_speed(line)

        for char in line:
            print(char, end="", flush=True)
            time.sleep(random.uniform(min_d, max_d))

        print(RESET)

# Run
print_lyrics()
