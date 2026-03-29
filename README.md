# iKey Compare

A web-based image comparison tool that submits two images to the **iKey AI analysis API** and returns a comparison result. It is the front-end client for the iKey pilot study endpoint at `https://api.ikey.ie:5000/api/pilotStudy2`.

---

## What It Does

The app lets a user upload two images side-by-side, optionally enter a credential (auth) code, and submit both images to the iKey backend API for analysis. The API processes the images and returns a JSON response containing the iKey analysis result, which is then displayed on the page.

---

## How It Works

### 1. Image Upload (Drag & Drop or Click)

Two upload zones are presented to the user. Each zone supports:
- **Click to upload** — opens a native file picker.
- **Drag and drop** — drag an image file directly onto the zone.

Once an image is selected, a **thumbnail preview** is immediately rendered inside the drop zone using the browser's `FileReader` API (reading the image as a Base64 data URL). The image data is stored in memory for later use.

A **×** close button appears on each zone, allowing the user to remove a selected image and reset that slot.

### 2. Credential Code

An optional text input labelled **"Credential code"** is included in the form. Its value is sent as part of the `FormData` payload to the API and is used for authentication/authorisation on the server side.

### 3. Form Submission

When the user clicks **"Press to iKey"**:
1. Validation checks that both image slots are filled. If not, the warning text ("Please add all field!") is hidden to prompt the user.
2. If both images are present, the form is submitted via **jQuery AJAX** (`$.ajax`) as a **multipart/form-data** POST request to:
   ```
   https://api.ikey.ie:5000/api/pilotStudy2
   ```
3. All form inputs are **disabled** during the request to prevent duplicate submissions.
4. A **progress bar** (`.meter`) animates while the request is in flight, incrementing by 2% every second to give visual feedback.

### 4. API Response

On a successful response:
- If `response.status === "OK"`, the `response.message` is displayed in the **"ikey analysis:"** section.
- Otherwise, the full raw JSON response is displayed for debugging.
- The progress bar is hidden, inputs are re-enabled, and the credential code field is restored.

### 5. Reset

Clicking the **Reset** button clears the analysis result text and resets the internal progress counter, without reloading the page.

---

## File Structure

```
ikey-compare/
├── index.html              # Main HTML page — form, drop zones, and result display
├── script.js               # App logic — drag & drop, thumbnail preview, AJAX submit
├── jquery-3.6.0.min.js     # jQuery 3.6.0 (used for AJAX and DOM helpers)
└── assets/
    ├── css/
    │   └── style.css       # Stylesheet (served from the iKey server)
    └── js/
        ├── script.js       # (served from the iKey server)
        └── jquery-3.6.0.min.js
```

> **Note:** `index.html`, `script.js`, and `jquery-3.6.0.min.js` in the root of this repository are local copies downloaded directly from `https://app.ikey.ie/` for development and reference purposes.

---

## API Endpoint

| Property     | Value                                          |
|-------------|------------------------------------------------|
| URL         | `https://api.ikey.ie:5000/api/pilotStudy2`     |
| Method      | `POST`                                         |
| Content-Type| `multipart/form-data`                          |
| Fields      | `image1`, `image2`, `authCode`                 |
| Response    | JSON: `{ status: "OK", message: "..." }` or error object |

---

## Dependencies

- **jQuery 3.6.0** — used for AJAX requests and DOM event handling on form submission and reset.
- No build tools or package managers are required. The app runs entirely in the browser.

---

## Usage

Open `index.html` in a browser (or serve it via a local HTTP server), then:

1. Enter your **credential code** (if required).
2. Upload or drag & drop **Image 1** into the first drop zone.
3. Upload or drag & drop **Image 2** into the second drop zone.
4. Click **"Press to iKey"** to submit.
5. Wait for the analysis result to appear in the **"ikey analysis:"** section.
6. Click **Reset** to clear the result and try again.
