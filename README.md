# Auth API
## Sidharth Sethi
### Deployled Link - [Heroku](https://tech-auth-api.herokuapp.com/ping)
This is a simple API for authentication.

### ```ping```
Test the API server.

### ```user/signup```

```json
{
    "email" : "",
    "username" : "",
    "password" : "",
    "confirmPassword" : ""
}
```

### ```users/login```

```json
{
    "username" : "",
    "password" : ""
}
```

### ```users/activate```

```json
{
    "email" : "",
    "code" : ""
}
```
### ```users/forgot```

```json
{
    "username" : ""
}
```

### ```users/reset```

```json
{
    "token" : "",
    "newPass": "",
    "confirmPass": ""
}
```
