# Create account

'*' means required

Request: `POST /api/createAccount`

Body (multipart/form-data):

-- username: Type: string, *

-- password: Type: string, *

What to provide:
    * username: Your account username
    * password: Your account password

Returns:
    type: string: `Account created!`