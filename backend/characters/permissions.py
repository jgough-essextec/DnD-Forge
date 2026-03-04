from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Object-level permission: only the owner of an object may access it.
    """

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user
