from PIL import Image, ImageSequence
import sys

INPUT = 'public/assets/images/scroll.gif'
OUTPUT = 'public/assets/images/scroll_reverse.gif'

def main():
    try:
        im = Image.open(INPUT)
    except FileNotFoundError:
        print(f'Input GIF not found: {INPUT}', file=sys.stderr)
        sys.exit(2)

    frames = []
    durations = []
    for frame in ImageSequence.Iterator(im):
        frames.append(frame.copy())
        durations.append(frame.info.get('duration', 100))

    if not frames:
        print('No frames found in GIF', file=sys.stderr)
        sys.exit(3)

    frames_rev = list(reversed(frames))
    durations_rev = list(reversed(durations))

    # save reversed GIF; Pillow accepts list for duration matching frames
    frames_rev[0].save(
        OUTPUT,
        save_all=True,
        append_images=frames_rev[1:],
        duration=durations_rev,
        loop=0,
        disposal=2,
    )

    print('Wrote reversed GIF to', OUTPUT)

if __name__ == '__main__':
    main()
