# Upload package

'*' means required

Request: `POST /api/upload`

Body (multipart/form-data):

-- data: Type: file, *

-- token: Type: string, *

-- username: Type: string, *

-- title: Type: string *

What to provide:
    * token: Your account token
    * data: Your package files
    * title: Your package title

Returns:
    type: string: `Package uploaded!`