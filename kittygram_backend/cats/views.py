from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .models import Achievement, Cat, Duel, Vote
from rest_framework.decorators import action
from .serializers import CatSerializer, AchievementSerializer, DuelSerializer, VoteSerializer
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from rest_framework import status
from django.db import IntegrityError

class DuelViewSet(viewsets.ModelViewSet):
    queryset = Duel.objects.all()
    serializer_class = DuelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def vote(self, request, pk=None):
        duel = self.get_object()
        user = request.user
        
        if Vote.objects.filter(duel=duel, user=user).exists():
            return Response(
                {"error": "Вы уже голосовали в этой дуэли"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Создаём голос вручную через модель
        try:
            vote = Vote.objects.create(
                duel=duel,
                user=user,
                chosen_cat_id=request.data.get('chosen_cat')
            )
            return Response(
                {"id": vote.id, "chosen_cat": vote.chosen_cat.id, "voted_at": vote.voted_at},
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            return Response(
                {"error": "Вы уже голосовали в этой дуэли"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        duel = self.get_object()
        data = {
            'duel_id': duel.id,
            'cat_a': duel.cat_a,
            'cat_b': duel.cat_b,
            'votes_a': duel.votes.filter(chosen_cat=duel.cat_a).count(),
            'votes_b': duel.votes.filter(chosen_cat=duel.cat_b).count(),
            'winner': None,
            'status': duel.status,
        }
        if duel.status == 'closed' or data['votes_a'] != data['votes_b']:
            if data['votes_a'] > data['votes_b']:
                data['winner'] = duel.cat_a
            elif data['votes_b'] > data['votes_a']:
                data['winner'] = duel.cat_b
        serializer = DuelResultSerializer(data)
        return Response(serializer.data)

class CatViewSet(viewsets.ModelViewSet):
    queryset = Cat.objects.all()
    serializer_class = CatSerializer
    pagination_class = PageNumberPagination 

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user) 


class AchievementViewSet(viewsets.ModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    pagination_class = None