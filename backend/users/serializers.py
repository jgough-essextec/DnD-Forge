from django.contrib.auth import authenticate, get_user_model, password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for reading user profile data."""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "display_name",
            "avatar_url",
            "date_joined",
        ]
        read_only_fields = ["id", "username", "date_joined"]


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration."""

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        normalized = value.lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return normalized

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )

        # Run Django's built-in password validators
        try:
            password_validation.validate_password(data["password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})

        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            raise serializers.ValidationError("Both username and password are required.")

        user = authenticate(username=username, password=password)

        if user is None:
            raise serializers.ValidationError("Invalid username or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account has been disabled.")

        data["user"] = user
        return data


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile fields."""

    class Meta:
        model = User
        fields = ["email", "display_name", "avatar_url", "preferences"]

    def validate_email(self, value):
        normalized = value.lower()
        user = self.context.get("request").user
        if User.objects.filter(email__iexact=normalized).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return normalized


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for user preferences (theme, auto-save, last active character)."""

    class Meta:
        from .models import UserPreferences

        model = UserPreferences
        fields = ["id", "user", "theme", "auto_save_enabled", "last_active_character"]
        read_only_fields = ["id", "user"]
