import cv2
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh
mp_pose = mp.solutions.pose

face_mesh = mp_face_mesh.FaceMesh()
pose = mp_pose.Pose()

def detect_face(frame):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    return face_mesh.process(rgb)

def detect_pose(frame):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    return pose.process(rgb)

def overlay_transparent(bg, overlay, x, y, size):
    overlay = cv2.resize(overlay, size)

    h, w, _ = overlay.shape

    if y + h > bg.shape[0] or x + w > bg.shape[1] or x < 0 or y < 0:
        return bg  # prevent crash

    b, g, r, a = cv2.split(overlay)
    mask = a / 255.0

    for c in range(3):
        bg[y:y+h, x:x+w, c] = (
            (1 - mask) * bg[y:y+h, x:x+w, c] +
            mask * overlay[:, :, c]
        )

    return bg

def recommend_size(width):
    if width < 120:
        return "S"
    elif width < 160:
        return "M"
    else:
        return "L"