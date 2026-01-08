import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';
import { spacing, typography } from '../../theme/theme';
import { CategorySpending } from '../../types';
import { Card } from '../atoms/Card';

interface ChartSectionProps {
  title: string;
  categoryBreakdown: CategorySpending[];
  currency: string;
  textColor?: string;
}

const screenWidth = Dimensions.get('window').width;

export const ChartSection: React.FC<ChartSectionProps> = ({
  title,
  categoryBreakdown,
  currency,
  textColor = Colors.text,
}) => {
  // Prepare data for the pie chart - take top 5 categories
  const topCategories = categoryBreakdown.slice(0, 5);
  
  if (topCategories.length === 0) {
    return (
      <Card style={styles.card}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: Colors.textLight }]}>
            No data available
          </Text>
        </View>
      </Card>
    );
  }

  const chartData = topCategories.map((item) => ({
    name: item.category.name,
    amount: item.amount,
    color: item.category.color,
    legendFontColor: textColor,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={screenWidth - spacing.md * 4}
          height={220}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute={false}
          hasLegend={true}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: spacing.md,
    padding: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
  },
});
