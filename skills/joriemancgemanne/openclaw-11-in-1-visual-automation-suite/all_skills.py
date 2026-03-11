
# Visual Automation Skill Package - All Skill Unit Definitions

---

## 1. init_env
### Description
Initialize visual automation runtime environment, check dependencies, create temp directory, load model resources

### Parameters
| Parameter | Type | Required | Description |
|--------|------|------|------|
| temp_dir | string | No | Temporary directory, uses system temp by default |
| ocr_model_path | string | No | OCR model path, uses built-in model by default |

### Returns
```json
{
  "success": true/false,
  "message": "Environment initialization result description",
  "temp_dir": "Temporary directory path",
  "ocr_model_loaded": true/false
}
```

---

## 2. screenshot_full
### Description
Capture full screen screenshot and save as image file

### Parameters
| Parameter | Type | Required | Description |
|--------|------|------|------|
| output_path | string | No | Output image path, generates temp file by default |
| format | string | No | Image format, supports png/jpg, default png |

### Returns
```json
{
  "success": true/false,
  "message": "Screenshot result description",
  "image_path": "Full path to screenshot file",
  "width": screenshot width,
  "height": screenshot height
}
```

---

## 3. check_screenshot_valid
### Description
Check if screenshot file is valid, verify file existence and image integrity

### Parameters
| Parameter | Type | Required | Description |
|--------|------|------|------|
| image_path | string | Yes | Path of image to check |

### Returns
```json
{
  "success": true/false,
  "valid": true/false,
  "message": "Check result description",
  "file_size": File size in bytes
}
```

---

## 4. wake_window
### Description
Wake specified window to foreground, prepare for interaction

### Parameters
| Parameter | Type | Required | Description |
|--------|------|------|------|
| window_title | string | No | Window title keyword, fuzzy match |
| window_handle | number | No | Window handle, exact specification |

### Returns
```json
{
  "success": true/false,
  "message": "Window wake result description",
  "window_handle": "Woken window handle"
}
```

---

## 5. ocr_recognize
### Description
Perform OCR text recognition on image, return recognition result and position coordinates

### Parameters
| Parameter | Type | Required | Description |
|--------|------|------|------|
| image_path | string | Yes | Path of image to recognize |
| region | array | No | Recognition area [x1, y1, x2, y2], full screen by default |
| lang | string | No | Recognition language, default chi_sim+eng for Chinese-English mix |

### Returns
```json
{
  "success": true/false,
  "message": "Recognition result description",
  "text": "Complete recognized text",
  "boxes": [
    {
      "text": "Single text block",
      "box": [x, y, w, h],
      "confidence": confidence 0-1
    }
  ]
}
```

---

## 6. template_match
### Description
Template matching, find the position of specified template image in the larger image

### Parameters
| Parameter | Type | Required | Description |
|--------|------|------|------|
| source_image | string | Yes | Source image (large image) path |
| template_image | string | Yes | Template image (small image) path |
| threshold | number | No | Matching threshold, default 0.8, range 0-1 |
| multiple | boolean | No | Return multiple matching results, default false |

### Returns
```json
{
  "success": true/false,
  "message": "Matching result description",
  "found": true/false,
  "count": Number of matches,
  "matches": [
    {
      "position": [x, y],
      "center": [center_x, center_y],
      "size": [w, h],
      "confidence": matching confidence 0-1
    }
  ]
}
```

---

## 7. locate_target
### Description
Locate target element, supports both OCR text localization and template matching localization

### Parameters
| Parameter | Type | Required | Description |
|--------|------|------|------|
| method | string | Yes | Localization method: ocr/template |
| target | string | Yes | OCR text OR template image path |
| screenshot | string | No | Screenshot path, auto re-screenshot if not provided |
| threshold | number | No | Matching threshold |

### Returns
```json
{
  "success": true/false,
  "found": true/false,
  "message": "Localization result description",
  "center": [target center coordinates x, y],
  "box": [x, y, w, h],
  "confidence": matching confidence
}
```

---

## 8. mouse_click
### Description
Perform mouse click operation at specified coordinates

### Parameters
| Parameter | Type | Required | Description |
|--------|------|------|------|
| x | number | Yes | Click X coordinate |
| y | number | Yes | Click Y coordinate |
| button | string | No | Mouse button: left/right/middle, default left |
| double | boolean | No | Double click, default false |
| move_duration | number | No | Mouse movement duration (seconds), default 0.1 |

### Returns
```json
{
  "success": true/false,
  "message": "Click operation result description",
  "position": [x, y]
}
```

---

## 9. keyboard_input
### Description
Perform keyboard input operation

### Parameters
| Parameter | Type | Required | Description |
|--------|------|------|------|
| text | string | Yes | Text to input |
| delay | number | No | Inter-key delay (seconds), default 0.05 |
| enter_after | boolean | No | Press Enter after input completes, default false |

### Returns
```json
{
  "success": true/false,
  "message": "Input operation result description",
  "chars_input": Number of characters input
}
```

---

## 10. clean_temp
### Description
Clean up temporary file directory, free disk space

### Parameters
| Parameter | Type | Required | Description |
|--------|------|------|------|
| keep_last | number | No | Keep last N temporary files, clean all by default |

### Returns
```json
{
  "success": true/false,
  "message": "Cleanup result description",
  "files_deleted": Number of files deleted,
  "space_freed": Space freed in bytes
}
```

---

## 11. loop_restart
### Description
Restart automation loop, reset state counter, clear exception flags

### Parameters
| Parameter | Type | Required | Description |
|--------|------|------|------|
| clear_temp | boolean | No | Clean temporary files at the same time, default true |

### Returns
```json
{
  "success": true,
  "message": "Loop restart completed",
  "reset_time": "Reset timestamp"
}
```
