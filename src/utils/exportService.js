import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class ExportService {
  constructor() {
    this.isExporting = false;
  }

  async exportToPDF(data, options = {}) {
    if (this.isExporting) {
      throw new Error('Export already in progress');
    }

    this.isExporting = true;

    try {
      const {
        location,
        date,
        sunData,
        weatherData,
        sunTimes,
        includeMap = true,
        includeSunPath = true,
        includeWeather = true,
        includeTimes = true,
        customNotes = '',
        quality = 'high'
      } = data;

      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Add header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SunViz Pro - Sun Analysis Report', margin, yPosition);
      yPosition += 15;

      // Add location and date info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      if (location) {
        pdf.text(`Location: ${location.name}`, margin, yPosition);
        yPosition += 7;
        pdf.text(`Coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`, margin, yPosition);
        yPosition += 7;
      }

      if (date) {
        pdf.text(`Date: ${date.toLocaleDateString()}`, margin, yPosition);
        yPosition += 7;
        pdf.text(`Time: ${date.toLocaleTimeString()}`, margin, yPosition);
        yPosition += 15;
      }

      // Add map screenshot if requested
      if (includeMap) {
        const mapElement = document.querySelector('.map-container');
        if (mapElement) {
          try {
            const canvas = await html2canvas(mapElement, {
              useCORS: true,
              scale: quality === 'high' ? 2 : 1,
              width: 800,
              height: 400
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height / canvas.width) * imgWidth;
            
            if (yPosition + imgHeight > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            
            pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
          } catch (error) {
            console.error('Failed to capture map:', error);
            pdf.text('Map capture failed', margin, yPosition);
            yPosition += 10;
          }
        }
      }

      // Add sun data if available
      if (sunData && includeSunPath) {
        if (yPosition + 40 > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Current Sun Position', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Azimuth: ${sunData.azimuth?.toFixed(1)}°`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Elevation: ${sunData.elevation?.toFixed(1)}°`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Altitude: ${sunData.altitude?.toFixed(1)}°`, margin, yPosition);
        yPosition += 15;
      }

      // Add sun times if available
      if (sunTimes && includeTimes) {
        if (yPosition + 60 > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Sun Times', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const timeData = [
          ['Sunrise:', this.formatTime(sunTimes.sunrise)],
          ['Sunset:', this.formatTime(sunTimes.sunset)],
          ['Solar Noon:', this.formatTime(sunTimes.solarNoon)],
          ['Golden Hour (Morning):', this.formatTime(sunTimes.goldenHourEnd)],
          ['Golden Hour (Evening):', this.formatTime(sunTimes.goldenHour)],
          ['Day Length:', `${sunTimes.dayLength?.toFixed(1)} hours`]
        ];

        timeData.forEach(([label, value]) => {
          pdf.text(label, margin, yPosition);
          pdf.text(value, margin + 60, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // Add weather data if available
      if (weatherData && includeWeather) {
        if (yPosition + 80 > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Weather Conditions', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const weatherInfo = [
          ['Temperature:', `${weatherData.temperature}°`],
          ['Condition:', weatherData.condition],
          ['Humidity:', `${weatherData.humidity}%`],
          ['Wind Speed:', `${weatherData.windSpeed} ${weatherData.windSpeed > 20 ? 'mph' : 'm/s'}`],
          ['Cloud Cover:', `${weatherData.cloudCover}%`],
          ['UV Index:', `${weatherData.uvIndex}`],
          ['Visibility:', `${weatherData.visibility} km`]
        ];

        weatherInfo.forEach(([label, value]) => {
          pdf.text(label, margin, yPosition);
          pdf.text(value, margin + 60, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // Add custom notes if provided
      if (customNotes && customNotes.trim()) {
        if (yPosition + 30 > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Notes', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        // Split long notes into multiple lines
        const lines = pdf.splitTextToSize(customNotes, pageWidth - 2 * margin);
        lines.forEach(line => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 6;
        });
      }

      // Add footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Generated by SunViz Pro', margin, footerY);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth - margin - 50, footerY);

      // Generate filename
      const locationName = location?.address?.city || location?.name?.split(',')[0] || 'location';
      const dateStr = date ? date.toISOString().split('T')[0] : 'unknown-date';
      const filename = `sunviz-${locationName.replace(/\s+/g, '-').toLowerCase()}-${dateStr}.pdf`;

      // Save the PDF
      pdf.save(filename);

      return {
        success: true,
        filename,
        message: 'Export completed successfully'
      };

    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Export failed: ${error.message}`);
    } finally {
      this.isExporting = false;
    }
  }

  async exportMapImage(mapElement, options = {}) {
    try {
      const canvas = await html2canvas(mapElement, {
        useCORS: true,
        scale: options.quality === 'high' ? 2 : 1,
        backgroundColor: '#ffffff',
        ...options
      });

      // Convert to blob
      return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });
    } catch (error) {
      console.error('Map image export error:', error);
      throw error;
    }
  }

  formatTime(time) {
    if (!time) return 'N/A';
    if (typeof time === 'string') return time;
    if (time instanceof Date) {
      return time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'N/A';
  }
}

export default new ExportService();