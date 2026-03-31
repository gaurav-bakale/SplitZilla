from abc import ABC, abstractmethod
from typing import Dict, List

class ISplitStrategy(ABC):
    @abstractmethod
    def split(self, amount: float, members: List[str], **kwargs) -> Dict[str, float]:
        pass

class EqualSplitStrategy(ISplitStrategy):
    def split(self, amount: float, members: List[str], **kwargs) -> Dict[str, float]:
        if not members:
            return {}
        
        per_person = amount / len(members)
        return {member: per_person for member in members}

class PercentageSplitStrategy(ISplitStrategy):
    def split(self, amount: float, members: List[str], **kwargs) -> Dict[str, float]:
        percentages = kwargs.get('percentages', {})
        
        if not percentages:
            raise ValueError("Percentages must be provided for percentage split")
        
        total_percentage = sum(percentages.values())
        if abs(total_percentage - 100.0) > 0.01:
            raise ValueError(f"Percentages must sum to 100, got {total_percentage}")
        
        return {member: (amount * percentages.get(member, 0) / 100.0) for member in members}

class ExactAmountSplitStrategy(ISplitStrategy):
    def split(self, amount: float, members: List[str], **kwargs) -> Dict[str, float]:
        exact_amounts = kwargs.get('exact_amounts', {})
        
        if not exact_amounts:
            raise ValueError("Exact amounts must be provided for exact split")
        
        total_split = sum(exact_amounts.values())
        if abs(total_split - amount) > 0.01:
            raise ValueError(f"Exact amounts must sum to total amount {amount}, got {total_split}")
        
        return exact_amounts

class SplitStrategyFactory:
    _strategies = {
        'equal': EqualSplitStrategy(),
        'percentage': PercentageSplitStrategy(),
        'exact': ExactAmountSplitStrategy()
    }
    
    @classmethod
    def get_strategy(cls, split_type: str) -> ISplitStrategy:
        strategy = cls._strategies.get(split_type.lower())
        if not strategy:
            raise ValueError(f"Unknown split type: {split_type}")
        return strategy
