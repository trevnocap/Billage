from rest_framework_simplejwt.tokens import AccessToken

class CustomAccessToken(AccessToken):
    @property
    def payload(self):
        print(self.user.id)
        payload = super().payload
        payload['user_id'] = self.user.id
        return payload
