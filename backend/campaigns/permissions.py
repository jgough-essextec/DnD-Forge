from rest_framework.permissions import BasePermission


class IsCampaignMember(BasePermission):
    """
    Object-level permission: allows access if the user owns the campaign
    OR has a character in it.
    """

    def has_object_permission(self, request, view, obj):
        if obj.owner == request.user:
            return True
        return obj.characters.filter(owner=request.user).exists()
