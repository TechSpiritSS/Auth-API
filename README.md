# Auth API
## Sidharth Sethi

This is a simple API for authentication.

### ```ping```
Test the API server.

### ```signup```

```json
{
    "email" : "",
    "username" : "",
    "password" : "",
    "confirmPassword" : ""
}
```

### ```login```

```json
{
    "username" : "",
    "password" : ""
}
```

### ```activate```

```json
{
    "email" : "",
    "code" : ""
}
```
### ```forgot```

```json
{
    "username" : ""
}
```

### ```reset```

```json
{
    "token" : "",
    "newPass": "",
    "confirmPass": ""
}
```