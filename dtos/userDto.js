module.exports = class UserDto {
    email;
    id;
    login;
    role;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.login = model.login;
        this.role = model.role;
    }
}