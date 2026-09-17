from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "role",
            "profile_photo",
        ]


class PublicUserSerializer(serializers.ModelSerializer):
    """Identity information safe to include in public property responses."""

    class Meta:
        model = User
        fields = ["id", "name", "role", "profile_photo"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = [
            "name",
            "email",
            "phone",
            "password",
            "role",
            "profile_photo",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """The safe, user-editable subset of a profile."""

    class Meta:
        model = User
        fields = ["name", "email", "phone", "profile_photo"]
