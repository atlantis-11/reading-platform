class RegistrationUserDataFactory {
    constructor(overrides = {}) {
        this.username = 'testuser';
        this.email = 'testuser@example.com';
        this.password = 'testpassword';

        Object.assign(this, overrides);
    }

    build() {
        return { ...this };
    }

    upperCase(field) {
        this[field] = this[field].toUpperCase();
        return this;
    }

    addPrefixTo(field) {
        this[field] = 'other' + this[field];
        return this;
    }
}

module.exports = RegistrationUserDataFactory;