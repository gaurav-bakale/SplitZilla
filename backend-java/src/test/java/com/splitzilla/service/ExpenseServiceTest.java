package com.splitzilla.service;

import com.splitzilla.model.Expense;
import com.splitzilla.model.Group;
import com.splitzilla.model.User;
import com.splitzilla.pattern.strategy.SplitStrategyFactory;
import com.splitzilla.repository.ExpenseRepository;
import com.splitzilla.repository.GroupRepository;
import com.splitzilla.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
public class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SplitStrategyFactory splitStrategyFactory;

    @InjectMocks
    private ExpenseService expenseService;

    private Group testGroup;
    private User testUser;
    private List<Expense> testExpenses;

    @BeforeEach
    public void setup() {
        testUser = new User();
        testUser.setUserId("user1");
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");

        testGroup = new Group();
        testGroup.setGroupId("group1");
        testGroup.setName("Test Group");
        testGroup.setMembers(new HashSet<>(Arrays.asList(testUser)));

        Expense expense1 = new Expense();
        expense1.setExpenseId("exp1");
        expense1.setDescription("Lunch");
        expense1.setAmount(50.0);
        expense1.setDate(LocalDateTime.now().minusDays(1));
        expense1.setPayer(testUser);

        Expense expense2 = new Expense();
        expense2.setExpenseId("exp2");
        expense2.setDescription("Dinner");
        expense2.setAmount(100.0);
        expense2.setDate(LocalDateTime.now());
        expense2.setPayer(testUser);

        testExpenses = Arrays.asList(expense1, expense2);
    }

    @Test
    public void testGetExpensesForGroup() {
        when(expenseRepository.findByGroupGroupId("group1")).thenReturn(testExpenses);

        List<Expense> result = expenseService.getExpensesForGroup("group1");

        assertEquals(2, result.size());
        verify(expenseRepository, times(1)).findByGroupGroupId("group1");
    }

    @Test
    public void testFilterExpensesBySearch() {
        when(expenseRepository.findByGroupGroupId("group1")).thenReturn(testExpenses);

        List<Expense> result = expenseService.filterExpenses("group1", "lunch", null, null, null, null, null);

        assertEquals(1, result.size());
        assertEquals("Lunch", result.get(0).getDescription());
    }

    @Test
    public void testFilterExpensesByAmount() {
        when(expenseRepository.findByGroupGroupId("group1")).thenReturn(testExpenses);

        List<Expense> result = expenseService.filterExpenses("group1", null, null, null, null, 75.0, null);

        assertEquals(1, result.size());
        assertEquals(100.0, result.get(0).getAmount());
    }

    @Test
    public void testExportExpensesToCsv() {
        when(groupRepository.findById("group1")).thenReturn(Optional.of(testGroup));
        when(expenseRepository.findByGroupGroupId("group1")).thenReturn(testExpenses);

        String csv = expenseService.exportExpensesToCsv("group1");

        assertNotNull(csv);
        assertTrue(csv.contains("Date,Description,Amount"));
        assertTrue(csv.contains("Lunch"));
        assertTrue(csv.contains("Dinner"));
    }

    @Test
    public void testGetGroupSummary() {
        when(groupRepository.findById("group1")).thenReturn(Optional.of(testGroup));
        when(expenseRepository.findByGroupGroupId("group1")).thenReturn(testExpenses);

        Map<String, Object> summary = expenseService.getGroupSummary("group1");

        assertNotNull(summary);
        assertEquals("Test Group", summary.get("group_name"));
        assertEquals(2, summary.get("total_expenses"));
        assertEquals(150.0, summary.get("total_amount"));
    }
}
