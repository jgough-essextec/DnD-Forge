from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

User = get_user_model()


class Command(BaseCommand):
    help = "Create a new user with the given username and password"

    def add_arguments(self, parser):
        parser.add_argument("username", type=str)
        parser.add_argument("password", type=str)

    def handle(self, *args, **options):
        username = options["username"]
        password = options["password"]

        if User.objects.filter(username=username).exists():
            raise CommandError(f'User "{username}" already exists')

        user = User.objects.create_user(username=username, password=password)
        self.stdout.write(self.style.SUCCESS(f'Created user "{user.username}"'))
