from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "avatar",
            "bio",
            "points",
            "date_joined",
            "is_staff",
        )
        read_only_fields = ("id", "points", "date_joined")

    def update(self, instance, validated_data):
        request = self.context.get("request")
        if not request or not request.user.is_staff:
            validated_data.pop("is_staff", None)
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
        )

    def validate_email(self, value: str) -> str:
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate(self, attrs):
        password = attrs.get("password")
        password_confirm = attrs.pop("password_confirm", None)
        if password != password_confirm:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        validate_password(password)
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
